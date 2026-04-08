/**
 * Left sidebar for the playground — room list, search, create new room, delete.
 */
import { useState } from 'react';
import { Button, Input, Popconfirm, Skeleton, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';

const ChatSidebar = ({
  rooms,
  activeRoomId,
  loading,
  onSelectRoom,
  onCreateRoom,
  onDeleteRoom,
}) => {
  const [search, setSearch] = useState('');

  const filtered = rooms.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#141414] border-r dark:border-gray-700 w-64 flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b dark:border-gray-700 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1">
          Playground
        </span>
        <Tooltip title="Cuộc trò chuyện mới">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onCreateRoom}
          />
        </Tooltip>
      </div>

      {/* Search */}
      <div className="p-2">
        <Input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          allowClear
        />
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} active paragraph={{ rows: 1 }} title={false} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
            {rooms.length === 0 ? 'Chưa có cuộc trò chuyện nào' : 'Không tìm thấy'}
          </div>
        ) : (
          filtered.map((room) => {
            const isActive = room.id === activeRoomId;
            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-300'
                }`}
              >
                <MessageOutlined className="flex-shrink-0 text-xs opacity-60" />
                <span className="flex-1 text-xs truncate">{room.title}</span>

                {/* Delete button — visible on hover */}
                <Popconfirm
                  title="Xoá cuộc trò chuyện này?"
                  onConfirm={(e) => { e?.stopPropagation(); onDeleteRoom(room.id); }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Xoá"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-red-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
