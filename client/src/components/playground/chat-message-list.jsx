/**
 * Scrollable list of chat messages with auto-scroll to bottom on new messages.
 * Also renders a streaming (partial) assistant bubble while AI is responding.
 */
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatMessageItem from './chat-message-item';

const StreamingBubble = ({ content }) => (
  <div className="flex justify-start px-4 py-1">
    <div className="max-w-[75%] px-4 py-2 rounded-2xl rounded-bl-none text-sm shadow-sm bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      <div className="text-xs font-semibold mb-1 opacity-60">🤖 AI</div>
      <div className="prose prose-sm dark:prose-invert max-w-none break-words
        prose-table:text-xs prose-td:px-2 prose-td:py-1 prose-th:px-2 prose-th:py-1
        prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
      <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
    </div>
  </div>
);

const ChatMessageList = ({ messages, streamingContent }) => {
  const bottomRef = useRef(null);

  // Auto-scroll whenever messages or streaming content changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
      {streamingContent && <StreamingBubble content={streamingContent} />}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
