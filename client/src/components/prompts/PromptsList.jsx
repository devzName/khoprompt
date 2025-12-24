import { FileTextOutlined, EditOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { List, Card, Tag, Button, Typography, Space, Tooltip } from 'antd';
import { ROUTES } from '../../constants/routes';
import PageHeader from '../shared/PageHeader';
import PromptsListControls from './PromptsListControls';
import EmptyState from '../EmptyState';

const { Text, Title } = Typography;

const PromptsList = ({
  searchValue,
  onSearchChange,
  onCreatePrompt,
  onMenuClick,
  prompts = [],
  loading = false,
  onSubmitPrompt
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusColor = (state) => {
    switch (state) {
      case 'DRAFT': return 'default';
      case 'SUBMITTED': return 'gold';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'ARCHIVED': return 'blue';
      default: return 'default';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('myPrompts.title')}
        breadcrumb={t('myPrompts.title')}
        onMenuClick={onMenuClick}
      >
        <PromptsListControls
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onCreatePrompt={onCreatePrompt}
        />
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
        {prompts.length === 0 && !loading ? (
          <EmptyState
            icon={FileTextOutlined}
            description={t('myPrompts.empty')}
            actionText={t('myPrompts.createFirst')}
            onAction={onCreatePrompt}
          />
        ) : (
          <div className="max-w-7xl mx-auto">
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
              dataSource={filteredPrompts}
              loading={loading}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-gray-200"
                    actions={[
                      <Tooltip title={t('common.view')} key="view">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(ROUTES.PROMPT_DETAIL_PATH(item.id))}
                        />
                      </Tooltip>,
                      <Tooltip title={t('common.edit')} key="edit">
                        <Button type="text" icon={<EditOutlined />} disabled={item.state === 'SUBMITTED' || item.state === 'APPROVED'} />
                      </Tooltip>,
                      item.state === 'DRAFT' && (
                        <Tooltip title={t('common.submit')} key="submit">
                          <Button
                            type="text"
                            icon={<SendOutlined />}
                            className="text-blue-600"
                            onClick={() => onSubmitPrompt && onSubmitPrompt(item.id)}
                          />
                        </Tooltip>
                      )
                    ].filter(Boolean)}
                  >
                    <div className="mb-3 flex justify-between items-start">
                      <Tag color={getStatusColor(item.state)} className="rounded-full border-0 px-3">
                        {t(`myPrompts.status.${item.state}`)}
                      </Tag>
                      {item.categoryInfo && (
                        <Text type="secondary" className="text-xs uppercase font-semibold">
                          {item.categoryInfo.name}
                        </Text>
                      )}
                    </div>
                    <Title level={5} className="mb-2 line-clamp-1">{item.title}</Title>
                    <Text type="secondary" className="line-clamp-2 text-sm h-10">
                      {item.description}
                    </Text>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptsList;