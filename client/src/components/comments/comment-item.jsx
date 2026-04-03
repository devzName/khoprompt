import { useState } from 'react';
import { Avatar, Button, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const DELETED_PLACEHOLDER = '[Bình luận đã bị xóa]';

/**
 * Renders a single comment with optional inline replies (1 level only).
 *
 * Props:
 *  - comment       {object}   comment data with .replies[]
 *  - currentUser   {object|null}
 *  - onReply       {(parentId: number) => void}
 *  - onDelete      {(commentId: number) => void}
 *  - isReply       {boolean}  true when rendering inside a reply list (suppress nested render)
 */
const CommentItem = ({ comment, currentUser, onReply, onDelete, isReply = false }) => {
  const isDeleted = Boolean(comment.deleted_at);
  const isOwner = currentUser && String(currentUser.id) === String(comment.user_id);
  const isAdmin = currentUser?.user_type === 'admin';
  const canDelete = !isDeleted && (isOwner || isAdmin);

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
      <Avatar
        size={isReply ? 32 : 40}
        icon={<UserOutlined />}
        className="shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
      />

      <div className="flex-1 min-w-0">
        {/* Author + timestamp row */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            {comment.author_name || 'Người dùng ẩn danh'}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {dayjs(comment.created_at).fromNow()}
          </span>
        </div>

        {/* Content */}
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isDeleted ? 'text-gray-400 italic' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {isDeleted ? DELETED_PLACEHOLDER : comment.content}
        </p>

        {/* Action row */}
        {!isDeleted && (
          <div className="flex items-center gap-3 mt-2">
            {!isReply && currentUser && (
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined />}
                className="text-gray-400 hover:text-blue-500 px-0 h-auto"
                onClick={() => onReply(comment.id)}
              >
                Trả lời
              </Button>
            )}
            {canDelete && (
              <Popconfirm
                title="Xóa bình luận?"
                description="Bình luận sẽ bị xóa vĩnh viễn khỏi màn hình."
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete(comment.id)}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  className="text-gray-400 hover:text-red-500 px-0 h-auto"
                >
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </div>
        )}

        {/* Replies — rendered only at depth 0 */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="border-l-2 border-gray-100 dark:border-gray-700 pl-2 mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onReply={onReply}
                onDelete={onDelete}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
