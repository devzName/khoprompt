import { useState } from 'react';
import { Button, Input, Typography, Tag, Spin, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, SendOutlined, FileTextOutlined, EyeOutlined, CalendarOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS, PROMPT_STATUS_COLORS, getStatusLabel } from '../../constants/promptStatus';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../EmptyState';
import ReviewPromptDrawer from './ReviewPromptDrawer';

const { Text, Title } = Typography;

const PromptsList = ({
  searchValue = '',
  onSearchChange,
  onCreatePrompt,
  onMenuClick,
  prompts = [],
  loading = false,
  onSubmitPrompt,
  onEditPrompt,
  onDeletePrompt,
  currentUser
}) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleQuickView = (prompt) => {
    setSelectedPrompt(prompt);
    setDrawerOpen(true);
  };

  const handleDeletePrompt = (promptId, promptTitle) => {
    Modal.confirm({
      title: t('myPrompts.deleteConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('myPrompts.deleteConfirmContent'),
      okText: t('myPrompts.deleteConfirmOk'),
      cancelText: t('myPrompts.deleteConfirmCancel'),
      okType: 'danger',
      onOk() {
        onDeletePrompt && onDeletePrompt(promptId);
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('myPrompts.title')}
        description={t('myPrompts.description')}
        breadcrumb={t('myPrompts.title')}
        onMenuClick={onMenuClick}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder={t('myPrompts.searchPlaceholder')}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchValue}
              onChange={onSearchChange}
              className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 shadow-sm"
              size="large"
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreatePrompt}
            size="large"
            className="whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t('myPrompts.createPrompt.title')}
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="w-full p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full min-h-[60vh]">
              <Spin size="large" />
              <Text className="mt-4 text-gray-600">{t('common.loading', 'Đang tải...')}</Text>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={FileTextOutlined}
                title={searchValue ? t('myPrompts.noResults') : t('myPrompts.noPrompts')}
                description={searchValue ? t('myPrompts.noResultsDescription') : t('myPrompts.noPromptsDescription')}
                actionText={!searchValue ? t('myPrompts.createPrompt.title') : undefined}
                onAction={!searchValue ? onCreatePrompt : undefined}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredPrompts.map((prompt, index) => (
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
                      className="text-sm leading-relaxed line-clamp-3 mb-4 block"
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
                        <span>{new Date(prompt.created_at).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeOutlined />
                        <span>{prompt.view_count || 0} lượt xem</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Row 1: Edit and Submit */}
                      <div className="flex gap-2">
                        <Button
                          type="default"
                          icon={<EditOutlined />}
                          onClick={() => onEditPrompt(prompt)}
                          disabled={prompt.status === PROMPT_STATUS.PENDING || prompt.status === PROMPT_STATUS.REJECTED}
                          className="flex-1 rounded-xl border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 hover:shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
                          size="middle"
                        >
                          {t('myPrompts.edit')}
                        </Button>
                        
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={() => onSubmitPrompt(prompt.id)}
                          disabled={prompt.status !== PROMPT_STATUS.DRAFT}
                          className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-sm hover:shadow-md disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200"
                          size="middle"
                        >
                          {t('myPrompts.submitForReview')}
                        </Button>
                      </div>
                      
                      {/* Row 2: Quick View and Delete */}
                      <div className="flex gap-2">
                        <Button
                          type="default"
                          icon={<EyeOutlined />}
                          onClick={() => handleQuickView(prompt)}
                          className="flex-1 rounded-xl border-gray-200 hover:border-green-400 hover:text-green-600 transition-all duration-200 hover:shadow-sm"
                          size="middle"
                        >
                          {t('latest.quickView', 'Xem nhanh')}
                        </Button>
                        
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeletePrompt(prompt.id, prompt.title)}
                          className="flex-1 rounded-xl border-red-200 text-red-600 hover:border-red-400 hover:text-red-700 transition-all duration-200 hover:shadow-sm"
                          size="middle"
                        >
                          {t('myPrompts.delete')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/20 transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewPromptDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prompt={selectedPrompt}
        currentUser={currentUser}
      />
    </div>
  );
};

export default PromptsList;