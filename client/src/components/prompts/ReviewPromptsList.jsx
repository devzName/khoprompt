import { useState } from 'react';
import { Button, Input, Typography, Tag, Spin, Pagination } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';

const { Search } = Input;
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS_COLORS, getStatusLabel } from '../../constants/promptStatus';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../EmptyState';
import PromptDrawer from '../PromptDrawer';

const { Text, Title } = Typography;

const ReviewPromptsList = ({
  searchValue = '',
  onSearchChange,
  onSearchSubmit, // Thêm prop mới cho search submit
  onMenuClick,
  prompts = [],
  loading = false,
  onApprovePrompt,
  onRejectPrompt,
  currentUser,
  pagination = null // Thêm prop pagination
}) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Sử dụng prompts trực tiếp từ API, không filter client-side
  const displayPrompts = prompts;

  const handleQuickView = (prompt) => {
    setSelectedPrompt(prompt);
    setDrawerOpen(true);
    setTimeout(() => {
      const drawerBody = document.querySelector('.ant-drawer-body');
      if (drawerBody) {
        drawerBody.scrollTop = 0;
      }
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('sidebar.reviewPrompts')}
        description={t('reviewPrompts.description', 'Duyệt và quản lý các prompts chờ phê duyệt')}
        breadcrumb={t('sidebar.reviewPrompts')}
        onMenuClick={onMenuClick}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              placeholder={t('myPrompts.searchPlaceholder')}
              value={searchValue}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
              className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 shadow-sm"
              size="large"
              allowClear
            />
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="w-full p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full min-h-[60vh]">
              <Spin size="large" />
              <Text className="mt-4 text-gray-600">{t('common.loading', 'Đang tải...')}</Text>
            </div>
          ) : displayPrompts.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CheckOutlined}
                title={t('reviewPrompts.noPendingTitle', 'Không có prompts chờ duyệt')}
                description={t('reviewPrompts.noPendingDesc', 'Tất cả prompts đã được xử lý')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {displayPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="group relative bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Tag 
                      color={PROMPT_STATUS_COLORS[prompt.status] || 'default'}
                      className="rounded-full px-3 py-1 text-xs font-medium border-0 shadow-sm backdrop-blur-sm"
                    >
                      {getStatusLabel(prompt.status, t)}
                    </Tag>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title */}
                    <Title 
                      level={4} 
                      className="mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 pr-16"
                      style={{ marginBottom: '12px' }}
                    >
                      {prompt.title}
                    </Title>

                    {/* Description */}
                    <Text 
                      type="secondary" 
                      className="text-sm leading-relaxed line-clamp-2 mb-4 block"
                    >
                      {prompt.description}
                    </Text>

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {prompt.tags.slice(0, 3).map((tag, index) => (
                          <Tag 
                            key={index} 
                            color="blue"
                            className="rounded-full text-xs px-2 py-0.5"
                          >
                            #{typeof tag === 'object' ? tag.name : tag}
                          </Tag>
                        ))}
                        {prompt.tags.length > 3 && (
                          <Tag 
                            color="blue"
                            className="rounded-full text-xs px-2 py-0.5"
                          >
                            +{prompt.tags.length - 3}
                          </Tag>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarOutlined />
                        <span>{new Date(prompt.created_at).toLocaleString(t('common.locale', 'vi-VN'), {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeOutlined />
                        <span>{prompt.view_count || 0} {t('myPromptDrawer.views', 'lượt xem')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Row 1: Approve and Reject */}
                      <div className="flex gap-2">
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => onApprovePrompt && onApprovePrompt(prompt.id)}
                          className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-sm hover:shadow-md transition-all duration-200"
                          size="middle"
                        >
                          {t('reviewPrompts.approve', 'Duyệt')}
                        </Button>
                        
                        <Button
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => onRejectPrompt && onRejectPrompt(prompt.id)}
                          className="flex-1 rounded-xl border-red-200 text-red-600 hover:border-red-400 hover:text-red-700 transition-all duration-200 hover:shadow-sm"
                          size="middle"
                        >
                          {t('reviewPrompts.reject', 'Từ chối')}
                        </Button>
                      </div>
                      
                      {/* Row 2: Quick View */}
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={() => handleQuickView(prompt)}
                        className="w-full rounded-xl border-gray-200 hover:border-green-400 hover:text-green-600 transition-all duration-200 hover:shadow-sm"
                        size="middle"
                      >
                        {t('latest.quickView', 'Xem nhanh')}
                      </Button>
                    </div>
                  </div>

                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/20 transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && displayPrompts.length > 0 && pagination.total > pagination.pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={pagination.onChange}
                showSizeChanger={pagination.showSizeChanger}
                showQuickJumper={pagination.showQuickJumper}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <PromptDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prompt={selectedPrompt}
        onApprove={onApprovePrompt}
        onReject={onRejectPrompt}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ReviewPromptsList;