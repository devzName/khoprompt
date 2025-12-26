import { EyeOutlined, CopyOutlined, CalendarOutlined, LikeOutlined, DislikeOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Drawer, Button, Tag, Avatar } from 'antd';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS_COLORS, getStatusLabel } from '../../constants/promptStatus';

const MyPromptDrawer = ({ open, onClose, prompt }) => {
  const { t } = useTranslation();

  const handleCopy = () => {
    if (prompt?.content) {
      navigator.clipboard.writeText(prompt.content);
    }
  };

  return (
    <Drawer
      title={prompt?.title}
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      className="my-prompt-drawer"
    >
      {prompt && (
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('myPromptDrawer.status')}</h3>
            <Tag 
              color={PROMPT_STATUS_COLORS[prompt.status] || 'default'}
              className="text-sm font-medium px-3 py-1"
            >
              {getStatusLabel(prompt.status, t)}
            </Tag>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('myPromptDrawer.description')}</h3>
            <div className="text-gray-600">
              {prompt.description}
            </div>
          </div>

          {/* Category & Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('myPromptDrawer.categoryTags')}</h3>
            <div className="flex flex-wrap gap-2">
              {prompt.category && (
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md">
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
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <EyeOutlined />
              <span>{prompt.view_count || 0} {t('myPromptDrawer.views')}</span>
            </div>
            <div className="flex items-center gap-1">
              <LikeOutlined className="text-green-600" />
              <span>{prompt.like_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <DislikeOutlined className="text-red-600" />
              <span>{prompt.dislike_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarOutlined />
              <span>{new Date(prompt.created_at).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>

          {/* Prompt Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('myPromptDrawer.promptContent')}</h3>
            <div className="bg-gray-50 rounded-lg p-4 relative">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {prompt.content}
              </pre>
              <Button
                icon={<CopyOutlined />}
                className="absolute top-2 right-2"
                size="small"
                onClick={handleCopy}
              >
                {t('myPromptDrawer.copy')}
              </Button>
            </div>
          </div>

          {/* Notes */}
          {prompt.full_description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('myPromptDrawer.notes')}</h3>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.full_description}
                </p>
              </div>
            </div>
          )}

          {/* Author Info */}
          {prompt.user && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('myPromptDrawer.author')}</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                <Avatar 
                  size={48} 
                  src={prompt.user.picture || prompt.user.avatar_url} 
                  icon={<UserOutlined />}
                  className="shrink-0"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    {prompt.user.full_name || prompt.user.name || 'Unknown User'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MailOutlined className="text-xs" />
                    <span>{prompt.user.email || 'No email'}</span>
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

export default MyPromptDrawer;