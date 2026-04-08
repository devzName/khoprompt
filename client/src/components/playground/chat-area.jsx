/**
 * Main chat area — composes header, message list, empty state, and input bar.
 * On mobile, shows a hamburger button to open the sidebar drawer.
 */
import { Button, Spin } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import ChatHeader from './chat-header';
import ChatMessageList from './chat-message-list';
import ChatInput from './chat-input';
import SuggestedPromptCards from './suggested-prompt-cards';

const MobileMenuBar = ({ onOpen }) => (
  <div className="md:hidden flex items-center px-3 py-1 bg-white dark:bg-[#141414] border-b dark:border-gray-700">
    <Button icon={<MenuOutlined />} type="text" onClick={onOpen} size="small" />
    <span className="text-xs text-gray-400 ml-2">Rooms</span>
  </div>
);

const ChatArea = ({
  room,
  models,
  messages,
  streamingContent,
  isStreaming,
  loadingMessages,
  onSendMessage,
  onAbort,
  onUpdateRoom,
  onSelectPrompt,
  onOpenMobileSidebar,
}) => {
  if (!room) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <MobileMenuBar onOpen={onOpenMobileSidebar} />
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          Chọn hoặc tạo cuộc trò chuyện để bắt đầu
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MobileMenuBar onOpen={onOpenMobileSidebar} />

      <ChatHeader
        room={room}
        models={models}
        onUpdateRoom={onUpdateRoom}
        disabled={isStreaming}
      />

      {loadingMessages ? (
        <div className="flex-1 flex items-center justify-center">
          <Spin />
        </div>
      ) : messages.length === 0 && !streamingContent ? (
        <SuggestedPromptCards onSelectPrompt={onSelectPrompt} />
      ) : (
        <ChatMessageList messages={messages} streamingContent={streamingContent} />
      )}

      <ChatInput
        onSend={onSendMessage}
        onAbort={onAbort}
        isStreaming={isStreaming}
        disabled={loadingMessages}
      />
    </div>
  );
};

export default ChatArea;
