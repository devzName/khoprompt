import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Spin, notification } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { commentService } from '../../services/comment-service';
import { ROUTES } from '../../constants/routes';
import CommentItem from './comment-item';

const { TextArea } = Input;

/**
 * Full comments section for a prompt detail page.
 *
 * Props:
 *  - promptId    {number}       ID of the prompt
 *  - currentUser {object|null}  authenticated user or null
 */
const CommentList = ({ promptId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentService.getComments(promptId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    if (promptId) loadComments();
  }, [promptId, loadComments]);

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    try {
      setSubmitting(true);
      const created = await commentService.addComment(promptId, trimmed);
      setComments((prev) => [...prev, { ...created, replies: created.replies || [] }]);
      setNewComment('');
    } catch (err) {
      notification.error({
        message: 'Không thể gửi bình luận',
        description: err.response?.data?.detail || 'Đã xảy ra lỗi.',
        placement: 'topRight',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed || replyToId == null) return;
    try {
      setReplySubmitting(true);
      const created = await commentService.addComment(promptId, trimmed, replyToId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyToId
            ? { ...c, replies: [...(c.replies || []), created] }
            : c
        )
      );
      setReplyToId(null);
      setReplyContent('');
    } catch (err) {
      notification.error({
        message: 'Không thể gửi trả lời',
        description: err.response?.data?.detail || 'Đã xảy ra lỗi.',
        placement: 'topRight',
      });
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(promptId, commentId);
      // Optimistically mark deleted in local state
      const markDeleted = (list) =>
        list.map((c) => {
          if (c.id === commentId) return { ...c, deleted_at: new Date().toISOString() };
          return { ...c, replies: (c.replies || []).map((r) => r.id === commentId ? { ...r, deleted_at: new Date().toISOString() } : r) };
        });
      setComments((prev) => markDeleted(prev));
    } catch (err) {
      notification.error({
        message: 'Không thể xóa bình luận',
        description: err.response?.data?.detail || 'Đã xảy ra lỗi.',
        placement: 'topRight',
      });
    }
  };

  const handleReplyClick = (parentId) => {
    // Toggle: clicking again on the same comment closes the reply box
    setReplyToId((prev) => (prev === parentId ? null : parentId));
    setReplyContent('');
  };

  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        Bình luận
        {totalCount > 0 && (
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#1f1f1f] px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        )}
      </h2>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-400 text-sm text-center py-6">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {comments.map((comment) => (
            <div key={comment.id} className="py-2">
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                onReply={handleReplyClick}
                onDelete={handleDelete}
              />

              {/* Inline reply form shown below the parent */}
              {replyToId === comment.id && (
                <div className="ml-10 mt-3 flex gap-2">
                  <TextArea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Viết trả lời..."
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    maxLength={2000}
                    className="flex-1 rounded-xl text-sm"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={replySubmitting}
                      disabled={!replyContent.trim()}
                      onClick={handleAddReply}
                      className="rounded-xl"
                    >
                      Gửi
                    </Button>
                    <Button
                      onClick={() => { setReplyToId(null); setReplyContent(''); }}
                      className="rounded-xl"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        {currentUser ? (
          <div className="flex gap-3">
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              autoSize={{ minRows: 3, maxRows: 8 }}
              maxLength={2000}
              showCount
              className="flex-1 rounded-xl text-sm"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={submitting}
              disabled={!newComment.trim()}
              onClick={handleAddComment}
              className="self-end rounded-xl h-10"
            >
              Gửi
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline font-medium">
              Đăng nhập
            </Link>{' '}
            để bình luận.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
