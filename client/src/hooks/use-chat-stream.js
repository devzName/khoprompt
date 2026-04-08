/**
 * Custom hook for consuming SSE streams from the chat send-message endpoint.
 * Parses "data: {...}" lines and exposes streaming state to the caller.
 *
 * Fixes applied:
 * - AbortController.signal is wired to the fetch call for real cancellation
 * - SSE error events are thrown outside the JSON.parse try/catch so they surface correctly
 */
import { useState, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';

export function useChatStream() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (roomId, content, { onDone, onError } = {}) => {
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Pass signal so abort() actually cancels the HTTP request
      const response = await chatService.sendMessageStream(roomId, content, controller.signal);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines (each ends with \n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // keep incomplete chunk

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;

          // Parse JSON separately from error handling so SSE errors aren't swallowed
          let event;
          try {
            event = JSON.parse(line.slice(6)); // strip "data: "
          } catch {
            continue; // truly malformed JSON — skip
          }

          if (event.type === 'chunk') {
            fullContent += event.content;
            setStreamingContent(fullContent);
          } else if (event.type === 'done') {
            setIsStreaming(false);
            setStreamingContent('');
            onDone?.({ content: fullContent, tokenCount: event.token_count });
            return;
          } else if (event.type === 'error') {
            // Throw outside try/catch so it propagates to the outer catch block
            throw new Error(event.message);
          }
        }
      }

      // Stream ended without explicit "done" (e.g. interrupted)
      setIsStreaming(false);
      setStreamingContent('');
      if (fullContent) {
        onDone?.({ content: fullContent, tokenCount: null });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setIsStreaming(false);
      setStreamingContent('');
      onError?.(err.message);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingContent('');
  }, []);

  return { sendMessage, streamingContent, isStreaming, error, abort };
}
