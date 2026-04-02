import { Button, Tag, Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';

// Props: prompt (object), onApprove(id), onReject(id), onDelete(id), isMobile (bool)
const KanbanCard = ({ prompt, onApprove, onReject, onDelete, isMobile = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const truncate = (text, len = 120) =>
    text && text.length > len ? `${text.slice(0, len)}...` : text;

  const statusColor = { pending: 'orange', approved: 'green', rejected: 'red' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-[#141414] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3 flex flex-col gap-2"
    >
      {/* Drag handle (hidden on mobile) */}
      {!isMobile && (
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 text-gray-400 cursor-grab active:cursor-grabbing select-none"
        >
          <HolderOutlined />
          <span className="text-xs">Kéo để di chuyển</span>
        </div>
      )}

      {/* Title */}
      <div className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-snug">{prompt.title}</div>

      {/* Author */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        @{prompt.user?.username || prompt.user?.email || 'unknown'}
      </div>

      {/* Content preview */}
      {prompt.content && (
        <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {truncate(prompt.content)}
        </div>
      )}

      {/* Status + Date */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <Tag color={statusColor[prompt.status] || 'default'} className="text-xs">
          {prompt.status}
        </Tag>
        <span className="text-xs text-gray-400">
          {dayjs(prompt.created_at).format('DD/MM/YYYY')}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 flex-wrap mt-1">
        {prompt.status === 'pending' && (
          <Tooltip title="Duyệt">
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onApprove(prompt.id)}
              className="flex-1"
            >
              Duyệt
            </Button>
          </Tooltip>
        )}
        <Tooltip title="Từ chối">
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => onReject(prompt.id)}
            className="flex-1"
          >
            Từ chối
          </Button>
        </Tooltip>
        <Tooltip title="Xóa">
          <Button
            size="small"
            icon={<DeleteOutlined />}
            aria-label="Xóa prompt"
            onClick={() => onDelete(prompt.id)}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default KanbanCard;
