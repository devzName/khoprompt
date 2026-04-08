/**
 * Playground page — chat rooms for testing prompts against AI models.
 * Manages all state: rooms, active room, messages, streaming.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message as antMessage, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { chatService } from '../services/chatService';
import { useChatStream } from '../hooks/use-chat-stream';
import ChatSidebar from '../components/playground/chat-sidebar';
import ChatArea from '../components/playground/chat-area';
import { ROUTES } from '../constants/routes';

const DEFAULT_MODEL = 'openai/gpt-oss-120b:free';

const PlaygroundPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // initialMessage is set when navigating from "Test in Playground"
  const initialMessage = location.state?.initialMessage ?? null;

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Prevent double-send of the initial message from router state
  const initialMessageSentRef = useRef(false);

  const { sendMessage, streamingContent, isStreaming, error: streamError, abort } = useChatStream();

  // Load models + rooms on mount
  useEffect(() => {
    Promise.all([chatService.getModels(), chatService.listRooms()])
      .then(([modelList, roomList]) => {
        setModels(modelList);
        setRooms(roomList);
        // Navigate to roomId from URL if provided
        if (roomId) {
          const found = roomList.find((r) => r.id === roomId);
          if (found) setActiveRoom(found);
        }
      })
      .catch(() => antMessage.error('Không thể tải danh sách phòng chat'))
      .finally(() => setLoadingRooms(false));
  }, []);

  // Load messages when active room changes; then auto-send initialMessage if present
  useEffect(() => {
    if (!activeRoom) return;
    navigate(ROUTES.PLAYGROUND_ROOM(activeRoom.id), { replace: true });
    setLoadingMessages(true);
    chatService
      .getMessages(activeRoom.id)
      .then((msgs) => {
        setMessages(msgs);
        // Auto-send the initial message once (from "Test in Playground" flow)
        if (initialMessage && !initialMessageSentRef.current && msgs.length === 0) {
          initialMessageSentRef.current = true;
          // Clear router state so refreshing doesn't re-send
          navigate(ROUTES.PLAYGROUND_ROOM(activeRoom.id), { replace: true, state: {} });
          // Slight delay so the UI has rendered before streaming starts
          setTimeout(() => handleSendMessage(initialMessage), 100);
        }
      })
      .catch(() => antMessage.error('Không thể tải tin nhắn'))
      .finally(() => setLoadingMessages(false));
  }, [activeRoom?.id]);

  // Show stream errors as toast
  useEffect(() => {
    if (streamError) antMessage.error(streamError);
  }, [streamError]);

  const handleSelectRoom = useCallback((id) => {
    const room = rooms.find((r) => r.id === id);
    if (room) setActiveRoom(room);
  }, [rooms]);

  const handleCreateRoom = useCallback(async () => {
    try {
      const defaultModel = models[0]?.id ?? DEFAULT_MODEL;
      const room = await chatService.createRoom({ title: 'New Chat', model: defaultModel });
      setRooms((prev) => [room, ...prev]);
      setActiveRoom(room);
      setMessages([]);
    } catch {
      antMessage.error('Không thể tạo phòng chat mới');
    }
  }, [models]);

  const handleDeleteRoom = useCallback(async (id) => {
    try {
      await chatService.deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      if (activeRoom?.id === id) {
        setActiveRoom(null);
        setMessages([]);
        navigate(ROUTES.PLAYGROUND, { replace: true });
      }
    } catch {
      antMessage.error('Không thể xoá phòng chat');
    }
  }, [activeRoom?.id]);

  const handleUpdateRoom = useCallback(async (updates) => {
    if (!activeRoom) return;
    try {
      const updated = await chatService.updateRoom(activeRoom.id, updates);
      setActiveRoom(updated);
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      antMessage.error('Không thể cập nhật phòng chat');
    }
  }, [activeRoom]);

  const handleSendMessage = useCallback(async (content) => {
    if (!activeRoom) return;

    const roomId = activeRoom.id;
    // Optimistic: show user message immediately using a stable tmp key
    const tmpId = `tmp-${Date.now()}-${Math.random()}`;
    const optimisticMsg = { id: tmpId, role: 'user', content, room_id: roomId };
    setMessages((prev) => [...prev, optimisticMsg]);

    await sendMessage(roomId, content, {
      onDone: () => {
        // Replace entire message list with server truth — only if still on same room
        chatService.getMessages(roomId).then((msgs) => {
          // Only update if the room hasn't changed (avoid stomping another room's messages)
          setMessages((prev) => {
            const stillSameRoom = prev.some((m) => m.room_id === roomId || m.id === tmpId);
            return stillSameRoom ? msgs : prev;
          });
        }).catch(() => {});
      },
      onError: (msg) => {
        antMessage.error(msg);
        setMessages((prev) => prev.filter((m) => m.id !== tmpId));
      },
    });
  }, [activeRoom, sendMessage]);

  // Called from SuggestedPromptCards — open prompt in a new room
  const handleSelectPrompt = useCallback(async (prompt) => {
    try {
      const defaultModel = models[0]?.id ?? DEFAULT_MODEL;
      // Strip HTML from prompt content for system prompt
      const div = document.createElement('div');
      div.innerHTML = prompt.content ?? '';
      const systemPrompt = div.textContent || div.innerText || '';

      const room = await chatService.createRoom({
        title: prompt.title,
        model: defaultModel,
        system_prompt: systemPrompt,
        source_prompt_id: prompt.id,
      });
      setRooms((prev) => [room, ...prev]);
      setActiveRoom(room);
      setMessages([]);
    } catch {
      antMessage.error('Không thể mở prompt trong playground');
    }
  }, [models]);

  const sidebarProps = {
    rooms,
    activeRoomId: activeRoom?.id,
    loading: loadingRooms,
    onSelectRoom: (id) => { handleSelectRoom(id); setMobileSidebarOpen(false); },
    onCreateRoom: () => { handleCreateRoom(); setMobileSidebarOpen(false); },
    onDeleteRoom: handleDeleteRoom,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0d0d0d]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <ChatSidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar — Drawer */}
      <Drawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        placement="left"
        width={256}
        styles={{ body: { padding: 0 } }}
        title={null}
        closable={false}
      >
        <ChatSidebar {...sidebarProps} />
      </Drawer>

      <ChatArea
        room={activeRoom}
        models={models}
        messages={messages}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        loadingMessages={loadingMessages}
        onSendMessage={handleSendMessage}
        onAbort={abort}
        onUpdateRoom={handleUpdateRoom}
        onSelectPrompt={handleSelectPrompt}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />
    </div>
  );
};

export default PlaygroundPage;
