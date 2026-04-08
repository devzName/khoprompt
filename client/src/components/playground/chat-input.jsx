/**
 * Message input bar — Enter to send, Shift+Enter for newline, disabled while streaming.
 */
import { useState, useCallback } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined, StopOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ChatInput = ({ onSend, onAbort, isStreaming, disabled = false }) => {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue('');
  }, [value, isStreaming, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t dark:border-gray-700 p-3 bg-white dark:bg-[#141414] flex gap-2 items-end">
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn... (Enter gửi, Shift+Enter xuống dòng)"
        autoSize={{ minRows: 1, maxRows: 6 }}
        disabled={disabled || isStreaming}
        className="flex-1 resize-none"
      />
      {isStreaming ? (
        <Button
          icon={<StopOutlined />}
          onClick={onAbort}
          danger
          className="flex-shrink-0"
        >
          Dừng
        </Button>
      ) : (
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0"
        >
          Gửi
        </Button>
      )}
    </div>
  );
};

export default ChatInput;
