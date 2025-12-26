import { EyeOutlined, CopyOutlined, CalendarOutlined, LikeOutlined, DislikeOutlined, UserOutlined, MailOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Drawer, Button, Tag, Avatar, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS_COLORS, getStatusLabel } from '../../constants/promptStatus';

const ReviewPromptDrawer = ({ open, onClose, prompt, onApprove, onReject, currentUser }) => {
  const { t } = useTranslation();

  const handleCopy = () => {
    if (prompt?.content) {
      navigator.clipboard.writeText(prompt.content);
    }
  };

  const handleApprove = () => {
    if (onApprove && prompt?.id) {
      onApprove(prompt.id);
      onClose();
    }
  };

  const handleReject = () => {
    if (onReject && prompt?.id) {
      onReject(prompt.id);
      onClose();
    }
  };

  // Show approve/reject buttons only for admin and pending prompts
  const showApprovalButtons = currentUser?.user_type === 'admin' && prompt?.status === 'pending';

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{prompt?.title}</span>
          <Tag 
            color={PROMPT_STATUS_COLORS[prompt?.status] || 'default'}
            className="text-sm font-medium px-3 py-1"
          >
            {getStatusLabel(prompt?.status, t)}
          </Tag>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      className="review-prompt-drawer"
      footer={
        showApprovalButtons ? (
          <div className="flex gap-3">
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApprove}
              className="flex-1 bg-green-500 hover:bg-green-600 border-green-500"
              size="large"
            >
              {t('reviewPrompts.approve', 'Duyệt')}
            </Button>
            <Button 
              danger
              icon={<CloseOutlined />}
              onClick={handleReject}
              className="flex-1"
              size="large"
            >
              {t('reviewPrompts.reject', 'Từ chối')}
            </Button>
          </div>
        ) : null
      }
    >
      {prompt && (
        <div className="space-y-6">
          {/* Prompt Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.promptDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">{t('reviewPromptDrawer.id')}:</span>
                <span className="ml-2 text-gray-600">#{prompt.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('reviewPromptDrawer.status')}:</span>
                <Tag 
                  color={PROMPT_STATUS_COLORS[prompt.status] || 'default'}
                  className="ml-2 text-xs"
                >
                  {getStatusLabel(prompt.status, t)}
                </Tag>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('reviewPromptDrawer.category')}:</span>
                <span className="ml-2 text-gray-600">
                  {typeof prompt.category === 'object' ? prompt.category?.name : prompt.category || t('reviewPromptDrawer.uncategorized')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('reviewPromptDrawer.author')}:</span>
                <span className="ml-2 text-gray-600">{prompt.user?.full_name || 'Unknown'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('reviewPromptDrawer.createdAt')}:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(prompt.created_at).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('reviewPromptDrawer.updatedAt')}:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(prompt.updated_at).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.description')}</h3>
            <div className="text-gray-700 leading-relaxed">
              {prompt.description}
            </div>
          </div>

          {/* Prompt Content - Highlighted */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.promptContent')}</h3>
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <pre className="whitespace-pre-wrap text-sm text-green-400 font-mono overflow-x-auto">
                {prompt.content}
              </pre>
              <Button
                icon={<CopyOutlined />}
                className="absolute top-2 right-2 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                size="small"
                onClick={handleCopy}
              >
                {t('reviewPromptDrawer.copy')}
              </Button>
            </div>
          </div>

          {/* Notes */}
          {prompt.full_description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.notes')}</h3>
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.full_description}
                </p>
              </div>
            </div>
          )}

          <Divider />

          {/* Category & Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.categoryTags')}</h3>
            <div className="flex flex-wrap gap-2">
              {prompt.category && (
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-md">
                  {typeof prompt.category === 'object' ? prompt.category?.name : prompt.category}
                </span>
              )}
              {prompt.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-md">
                  #{typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.statsInteraction')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg border">
                <EyeOutlined className="text-blue-500 text-xl mb-2" />
                <div className="font-semibold text-gray-900">{prompt.view_count || 0}</div>
                <div className="text-gray-600 text-xs">{t('reviewPromptDrawer.views')}</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <LikeOutlined className="text-green-500 text-xl mb-2" />
                <div className="font-semibold text-gray-900">{prompt.like_count || 0}</div>
                <div className="text-gray-600 text-xs">{t('reviewPromptDrawer.likes')}</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <DislikeOutlined className="text-red-500 text-xl mb-2" />
                <div className="font-semibold text-gray-900">{prompt.dislike_count || 0}</div>
                <div className="text-gray-600 text-xs">{t('reviewPromptDrawer.dislikes')}</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <CalendarOutlined className="text-purple-500 text-xl mb-2" />
                <div className="font-semibold text-gray-900">
                  {Math.ceil((new Date() - new Date(prompt.created_at)) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-gray-600 text-xs">{t('reviewPromptDrawer.ageInDays')}</div>
              </div>
            </div>
            
            {/* Additional Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('reviewPromptDrawer.likeRatio')}:</span>
                  <span className="ml-2 text-gray-600">
                    {prompt.like_count + prompt.dislike_count > 0 
                      ? `${Math.round((prompt.like_count / (prompt.like_count + prompt.dislike_count)) * 100)}%`
                      : t('reviewPromptDrawer.noRating')
                    }
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tags:</span>
                  <span className="ml-2 text-gray-600">{prompt.tags?.length || 0} {t('reviewPromptDrawer.tagCount')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Author Info - Last */}
          {prompt.user && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviewPromptDrawer.authorInfo')}</h3>
              <div className="flex items-start gap-4">
                <Avatar 
                  size={64} 
                  src={prompt.user.picture || prompt.user.avatar_url} 
                  icon={<UserOutlined />}
                  className="shrink-0"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-2">
                    {prompt.user.full_name || prompt.user.name || 'Unknown User'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MailOutlined className="text-xs" />
                      <span>{prompt.user.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserOutlined className="text-xs" />
                      <span>ID: {prompt.user.id}</span>
                    </div>
                    {prompt.user.user_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Tag color={prompt.user.user_type === 'admin' ? 'red' : 'blue'} className="text-xs">
                          {prompt.user.user_type === 'admin' ? t('reviewPromptDrawer.admin') : t('reviewPromptDrawer.user')}
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default ReviewPromptDrawer;