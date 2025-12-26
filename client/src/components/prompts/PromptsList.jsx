import { useState } from 'react';
import { Button, Input, Typography, Card, Tag, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, SendOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../EmptyState';

const { Text, Title } = Typography;

const PromptsList = ({
  searchValue = '',
  onSearchChange,
  onCreatePrompt,
  onMenuClick,
  prompts = [],
  loading = false,
  onSubmitPrompt,
  onEditPrompt
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('myPrompts.title')}
        description={t('myPrompts.description')}
        breadcrumb={t('myPrompts.title')}
        onMenuClick={onMenuClick}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder={t('myPrompts.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={onSearchChange}
            className="flex-1 max-w-md"
            size="large"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreatePrompt}
            size="large"
            className="whitespace-nowrap"
          >
            {t('myPrompts.createPrompt.title')}
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : filteredPrompts.length === 0 ? (
            <EmptyState
              icon={FileTextOutlined}
              title={searchValue ? t('myPrompts.noResults') : t('myPrompts.noPrompts')}
              description={searchValue ? t('myPrompts.noResultsDescription') : t('myPrompts.noPromptsDescription')}
              actionText={!searchValue ? t('myPrompts.createPrompt.title') : undefined}
              onAction={!searchValue ? onCreatePrompt : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => onEditPrompt(prompt)}
                    >
                      {t('myPrompts.edit')}
                    </Button>,
                    <Button
                      key="submit"
                      type="text"
                      icon={<SendOutlined />}
                      onClick={() => onSubmitPrompt(prompt.id)}
                      disabled={prompt.status !== 'draft'}
                    >
                      {t('myPrompts.submitForReview')}
                    </Button>
                  ]}
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Title level={5} className="mb-0 line-clamp-1">
                        {prompt.title}
                      </Title>
                      <Tag color={prompt.status === 'approved' ? 'green' : prompt.status === 'pending' ? 'orange' : 'default'}>
                        {prompt.status}
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-sm line-clamp-2">
                      {prompt.description}
                    </Text>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prompt.tags?.slice(0, 3).map((tag, index) => (
                      <Tag key={index} size="small">
                        {typeof tag === 'object' ? tag.name : tag}
                      </Tag>
                    ))}
                    {prompt.tags?.length > 3 && (
                      <Tag size="small">+{prompt.tags.length - 3}</Tag>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {t('myPrompts.createdAt')}: {new Date(prompt.created_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptsList;