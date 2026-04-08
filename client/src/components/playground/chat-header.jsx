/**
 * Chat area header — editable room title and model selector.
 */
import { useState } from 'react';
import { Typography, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import ModelSelector from './model-selector';

const { Text } = Typography;

const ChatHeader = ({ room, models, onUpdateRoom, disabled = false }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(room?.title ?? 'New Chat');

  const handleTitleSubmit = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== room?.title) {
      onUpdateRoom({ title: trimmed });
    }
    setEditingTitle(false);
  };

  const handleModelChange = (modelId) => {
    onUpdateRoom({ model: modelId });
  };

  if (!room) return null;

  return (
    <div className="border-b dark:border-gray-700 px-4 py-2 bg-white dark:bg-[#141414] flex items-center gap-3 min-h-[52px]">
      {/* Editable title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') setEditingTitle(false);
            }}
            className="w-full bg-transparent border-b border-blue-400 outline-none text-sm font-medium text-gray-900 dark:text-gray-100 py-0.5"
          />
        ) : (
          <Tooltip title="Nhấp để đổi tên">
            <button
              onClick={() => { setTitleValue(room.title); setEditingTitle(true); }}
              disabled={disabled}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs hover:text-blue-500 transition-colors"
            >
              <span className="truncate">{room.title}</span>
              <EditOutlined className="flex-shrink-0 text-xs opacity-50" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Model selector */}
      <ModelSelector
        models={models}
        value={room.model}
        onChange={handleModelChange}
        disabled={disabled}
      />
    </div>
  );
};

export default ChatHeader;
