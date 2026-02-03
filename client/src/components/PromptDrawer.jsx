import { EyeOutlined, LikeOutlined, DislikeOutlined, CopyOutlined, LinkOutlined, CalendarOutlined, UserOutlined, MailOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Drawer, Button, Tag, Avatar, notification, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants/routes';
import ImageGallery from './ImageGallery';

// Get server URL for images
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const PromptDrawer = ({ open, onClose, prompt, onApprove, onReject, currentUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleCopy = () => {
    if (prompt?.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = prompt.content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      navigator.clipboard.writeText(plainText);
      notification.success({
        message: t('common.success', 'Success'),
        description: t('promptDetail.copied', 'Đã copy!'),
        placement: 'topRight',
        duration: 2
      });
    }
  };
  const handleViewDetail = () => {
    navigate(ROUTES.PROMPT_DETAIL_PATH(prompt.slug));
    onClose();
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
  const showApprovalButtons = currentUser?.user_type === 'admin' && prompt?.status === 'pending';
  return (
    <Drawer
      title={
        <div>
          <div className="text-lg font-semibold">{prompt?.title}</div>
          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
            {prompt?.description}
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      className="prompt-drawer"
      footer={
        <div className="space-y-3">
          {showApprovalButtons && (
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
          )}
          
          <Button 
            icon={<LinkOutlined />}
            className="w-full"
            size="large"
            onClick={handleViewDetail}
          >
            {t('drawer.viewDetail', 'Xem chi tiết')}
          </Button>
        </div>
      }
    >
      {prompt && (
        <div className="space-y-6">
          {/* Category & Tags Section */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              {t('reviewPromptDrawer.categoryTags', 'Danh mục & Tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {prompt.category && (
                <Badge 
                  count={typeof prompt.category === 'object' ? prompt.category?.name : prompt.category}
                  style={{ 
                    backgroundColor: '#e6f4ff', 
                    color: '#1677ff',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    height: 'auto',
                    lineHeight: '1.4'
                  }}
                />
              )}
              {prompt.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  #{typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <ImageGallery 
            images={prompt.images} 
            title={prompt.title}
            serverUrl={SERVER_URL}
            isDrawer={true}
          />

          {/* Stats Section */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg">
              <EyeOutlined className="text-gray-600 text-xs" />
              <span className="text-xs font-medium text-gray-900">{prompt.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-green-400 rounded-lg">
              <LikeOutlined className="text-green-600 text-xs" />
              <span className="text-xs font-medium text-gray-900">{prompt.like_count || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-red-400 rounded-lg">
              <DislikeOutlined className="text-red-600 text-xs" />
              <span className="text-xs font-medium text-gray-900">{prompt.dislike_count || 0}</span>
            </div>
          </div>

          {/* Prompt Content */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              {t('reviewPromptDrawer.promptContent', 'Nội dung Prompt')}
            </h3>
            <div className="rounded-lg p-4 relative border border-gray-300" style={{ backgroundColor: '#f5f5f5' }}>
              <div 
                className="text-gray-800 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: prompt.content || '' }}
              />
              <Button
                icon={<CopyOutlined />}
                className="absolute top-2 right-2 bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                size="small"
                onClick={handleCopy}
              >
                {t('reviewPromptDrawer.copy', 'Copy')}
              </Button>
            </div>
          </div>

          {/* Notes if exists */}
          {prompt.notes && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">
                {t('reviewPromptDrawer.notes', 'Ghi chú')}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.notes}
                </p>
              </div>
            </div>
          )}

          {prompt.user && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">
                {t('reviewPromptDrawer.authorInfo', 'Thông tin tác giả')}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar 
                    size={48} 
                    src={prompt.user.picture || prompt.user.avatar_url} 
                    icon={<UserOutlined />}
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {prompt.user.full_name || prompt.user.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {prompt.user.email || 'No email'}
                    </div>
                    {prompt.user.user_type && (
                      <Tag 
                        color={prompt.user.user_type === 'admin' ? 'red' : 'blue'} 
                        className="text-xs mt-1"
                        size="small"
                      >
                        {prompt.user.user_type === 'admin' ? t('reviewPromptDrawer.admin') : t('reviewPromptDrawer.user')}
                      </Tag>
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
export default PromptDrawer;