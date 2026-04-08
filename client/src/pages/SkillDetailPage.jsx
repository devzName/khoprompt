/**
 * Skill detail page — shows skill info, compiled outputs, and engagement.
 * Route: /skills/:id
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Button, Tag, Spin, Empty, Drawer, Popconfirm, notification, Input, Avatar, Divider } from 'antd';
import {
  LikeOutlined, LikeFilled, DislikeFilled, DislikeOutlined,
  BookOutlined, BookFilled, EyeOutlined, EditOutlined, DeleteOutlined, SendOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import { skillService } from '../services/skillService';
import { ROUTES } from '../constants/routes';
import Sidebar from '../components/Sidebar';
import CompilationPreview from '../components/skills/compilation-preview';

const AGENTS = ['claude', 'copilot', 'cursor', 'codex', 'opencode'];

const CommentItem = ({ comment, skillId, currentUser, onDelete, onReply }) => {
  const { t } = useTranslation();
  const isDeleted = !!comment.deleted_at;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <Avatar size={28} src={comment.user?.avatar_url}>{comment.author_name?.[0]}</Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{comment.author_name}</span>
            <span className="text-xs text-gray-400 dark:text-neutral-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${isDeleted ? 'text-gray-400 italic' : ''}`}>
            {isDeleted ? t('skills.commentDeleted', '[deleted]') : comment.content}
          </p>
          {!isDeleted && (
            <div className="flex gap-2 mt-1">
              {!comment.parent_id && (
                <button onClick={() => onReply(comment.id)} className="text-xs text-gray-400 hover:text-gray-600">
                  {t('skills.reply', 'Reply')}
                </button>
              )}
              {(currentUser?.id === comment.user_id || currentUser?.user_type === 'admin') && (
                <Popconfirm
                  title={t('skills.confirmDelete', 'Delete this comment?')}
                  onConfirm={() => onDelete(comment.id)}
                  okType="danger"
                >
                  <button className="text-xs text-red-400 hover:text-red-600">
                    {t('common.delete', 'Delete')}
                  </button>
                </Popconfirm>
              )}
            </div>
          )}
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="ml-9 flex flex-col gap-3 mt-1">
          {comment.replies.map(r => (
            <CommentItem key={r.id} comment={r} skillId={skillId} currentUser={currentUser} onDelete={onDelete} onReply={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

const SkillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voteState, setVoteState] = useState(null); // 'like' | 'dislike' | null
  const [bookmarked, setBookmarked] = useState(false);
  const [engagementCounts, setEngagementCounts] = useState({ like: 0, dislike: 0, view: 0, bookmark: 0 });

  const menuItems = useSidebarMenu('skills', user, navigate, null, t);
  const isOwner = user?.id === skill?.created_by;

  useEffect(() => {
    skillService.getSkill(id)
      .then(data => {
        setSkill(data);
        setEngagementCounts({
          like: data.like_count ?? 0,
          dislike: data.dislike_count ?? 0,
          view: data.view_count ?? 0,
          bookmark: data.bookmark_count ?? 0,
        });
      })
      .catch(() => notification.error({ message: t('common.error'), placement: 'topRight' }))
      .finally(() => setLoading(false));
    skillService.getComments(id).then(setComments).catch(() => {});
    skillService.trackView(id).catch(() => {});
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVote = async (isHelpful) => {
    const key = isHelpful ? 'like' : 'dislike';
    const opposite = isHelpful ? 'dislike' : 'like';
    try {
      if (voteState === key) {
        await skillService.removeVote(id);
        setVoteState(null);
        setEngagementCounts(c => ({ ...c, [key]: c[key] - 1 }));
      } else {
        await skillService.vote(id, isHelpful);
        setEngagementCounts(c => ({
          ...c,
          [key]: c[key] + 1,
          [opposite]: voteState === opposite ? c[opposite] - 1 : c[opposite],
        }));
        setVoteState(key);
      }
    } catch { notification.error({ message: t('common.error'), placement: 'topRight' }); }
  };

  const handleBookmark = async () => {
    try {
      const res = await skillService.toggleBookmark(id);
      setBookmarked(res.is_bookmarked);
      setEngagementCounts(c => ({ ...c, bookmark: res.is_bookmarked ? c.bookmark + 1 : c.bookmark - 1 }));
    } catch { notification.error({ message: t('common.error'), placement: 'topRight' }); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const newComment = await skillService.addComment(id, commentText.trim(), replyTo);
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo ? { ...c, replies: [...(c.replies || []), newComment] } : c
        ));
      } else {
        setComments(prev => [...prev, { ...newComment, replies: [] }]);
      }
      setCommentText('');
      setReplyTo(null);
    } catch { notification.error({ message: t('common.error'), placement: 'topRight' }); }
    finally { setSubmittingComment(false); }
  };

  const handleDeleteComment = async (cid) => {
    try {
      await skillService.deleteComment(id, cid);
      setComments(prev => prev.map(c =>
        c.id === cid ? { ...c, deleted_at: new Date().toISOString() }
          : { ...c, replies: c.replies?.map(r => r.id === cid ? { ...r, deleted_at: new Date().toISOString() } : r) }
      ));
    } catch { notification.error({ message: t('common.error'), placement: 'topRight' }); }
  };

  const handleDelete = async () => {
    try {
      await skillService.deleteSkill(id);
      notification.success({ message: t('skills.deleteSuccess', 'Skill deleted'), placement: 'topRight' });
      navigate(ROUTES.SKILLS);
    } catch { notification.error({ message: t('common.error'), placement: 'topRight' }); }
  };

  const compilationMap = Object.fromEntries(
    (skill?.compilations || []).map(c => [c.agent, c.output])
  );

  const tabItems = AGENTS.map(agent => ({
    key: agent,
    label: agent.charAt(0).toUpperCase() + agent.slice(1),
    children: <CompilationPreview agent={agent} output={compilationMap[agent]} />,
  }));

  return (
    <div className="flex h-full bg-white dark:bg-[#111]">
      <div className="hidden lg:block">
        <Sidebar menuItems={menuItems} activeTab="skills" />
      </div>
      <Drawer title={null} placement="left" onClose={() => setMobileMenuOpen(false)} open={mobileMenuOpen} width={208} styles={{ body: { padding: 0 } }} closeIcon={null}>
        <Sidebar menuItems={menuItems} activeTab="skills" isMobile onClose={() => setMobileMenuOpen(false)} />
      </Drawer>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-16"><Spin size="large" /></div>
        ) : !skill ? (
          <Empty description={t('skills.notFound', 'Skill not found')} />
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">{skill.name}</h1>
                {skill.description && <p className="text-gray-500 dark:text-neutral-400">{skill.description}</p>}
                <div className="flex flex-wrap gap-1 items-center">
                  {skill.category && <Tag color="blue">{skill.category}</Tag>}
                  {skill.tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}
                </div>
                <div className="text-xs text-gray-400 dark:text-neutral-500">
                  {t('skills.by', 'By')} {skill.user?.full_name || '—'} · {new Date(skill.created_at).toLocaleDateString()}
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2 shrink-0">
                  <Button icon={<EditOutlined />} onClick={() => navigate(ROUTES.SKILL_EDIT_PATH(id))} size="small">
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Popconfirm title={t('skills.confirmDeleteSkill', 'Delete this skill?')} onConfirm={handleDelete} okType="danger">
                    <Button icon={<DeleteOutlined />} danger size="small">{t('common.delete', 'Delete')}</Button>
                  </Popconfirm>
                </div>
              )}
            </div>

            {/* Engagement bar */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-gray-500"><EyeOutlined />{engagementCounts.view}</span>
              <Button
                size="small" type={voteState === 'like' ? 'primary' : 'default'}
                icon={voteState === 'like' ? <LikeFilled /> : <LikeOutlined />}
                onClick={() => handleVote(true)}
              >{engagementCounts.like}</Button>
              <Button
                size="small" type={voteState === 'dislike' ? 'primary' : 'default'} danger={voteState === 'dislike'}
                icon={voteState === 'dislike' ? <DislikeFilled /> : <DislikeOutlined />}
                onClick={() => handleVote(false)}
              >{engagementCounts.dislike}</Button>
              <Button
                size="small" type={bookmarked ? 'primary' : 'default'}
                icon={bookmarked ? <BookFilled /> : <BookOutlined />}
                onClick={handleBookmark}
              >{engagementCounts.bookmark}</Button>
            </div>

            {/* Compilations */}
            <div className="border border-gray-200 dark:border-white/10 rounded-lg p-4">
              <Tabs items={tabItems} defaultActiveKey="claude" />
            </div>

            {/* Comments */}
            <div>
              <Divider orientation="left" className="text-sm font-medium">
                {t('skills.comments', 'Comments')} ({comments.length})
              </Divider>
              <div className="flex flex-col gap-4">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-neutral-500">{t('skills.noComments', 'No comments yet.')}</p>
                )}
                {comments.map(c => (
                  <CommentItem key={c.id} comment={c} skillId={id} currentUser={user} onDelete={handleDeleteComment} onReply={setReplyTo} />
                ))}
              </div>
              {replyTo && (
                <div className="text-xs text-gray-400 mt-3 mb-1">
                  {t('skills.replyingTo', 'Replying to comment #{{id}}', { id: replyTo })}
                  <button onClick={() => setReplyTo(null)} className="ml-2 text-red-400">{t('common.cancel')}</button>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Input.TextArea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={t('skills.addComment', 'Add a comment...')}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                />
                <Button
                  type="primary" icon={<SendOutlined />}
                  loading={submittingComment}
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >{t('common.submit', 'Submit')}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDetailPage;
