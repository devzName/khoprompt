import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Tag, Space, Card, List, Typography, Tooltip, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';

const { Text, Title, Paragraph } = Typography;

const ReviewPromptsList = ({
    prompts,
    loading,
    handleApprove,
    handleReject,
    onMenuClick
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            <PageHeader
                title={t('header.reviewPrompts')}
                breadcrumb={t('header.reviewPrompts')}
                onMenuClick={onMenuClick}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    <List
                        grid={{ gutter: 16, column: 1 }}
                        dataSource={prompts}
                        loading={loading}
                        locale={{
                            emptyText: (
                                <Card className="rounded-2xl shadow-sm border-gray-100 py-12">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className="text-center text-gray-500">
                                                <Title level={4} className="mt-4 mb-2">{t('reviewPrompts.noPendingTitle')}</Title>
                                                <Paragraph>{t('reviewPrompts.noPendingDesc')}</Paragraph>
                                            </div>
                                        }
                                    />
                                </Card>
                            )
                        }}
                        renderItem={(item) => (
                            <List.Item>
                                <Card
                                    className="rounded-2xl shadow-sm hover:shadow-md transition-all border-gray-100 overflow-hidden"
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag color="gold" className="rounded-full border-0 px-3 py-0.5 m-0 font-medium">
                                                    {t('myPrompts.status.SUBMITTED')}
                                                </Tag>
                                                {item.categoryInfo && (
                                                    <Tag color="blue" className="rounded-full border-0 px-3 py-0.5 m-0 font-medium">
                                                        {item.categoryInfo.name}
                                                    </Tag>
                                                )}
                                            </div>

                                            <Title level={4} className="mb-2 truncate !mt-0">
                                                {item.title}
                                            </Title>

                                            <Text type="secondary" className="block mb-4 line-clamp-2">
                                                {item.description}
                                            </Text>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <UserOutlined /> {item.author || 'Anonymous'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarOutlined /> {new Date().toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col justify-end gap-3 shrink-0">
                                            <Tooltip title={t('reviewPrompts.approve')}>
                                                <Button
                                                    type="primary"
                                                    icon={<CheckCircleOutlined />}
                                                    onClick={() => handleApprove(item.id)}
                                                    className="bg-green-600 hover:bg-green-700 border-0 h-11 px-6 rounded-xl flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all"
                                                >
                                                    {t('reviewPrompts.approve')}
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title={t('reviewPrompts.reject')}>
                                                <Button
                                                    danger
                                                    icon={<CloseCircleOutlined />}
                                                    onClick={() => handleReject(item.id)}
                                                    className="h-11 px-6 rounded-xl flex items-center justify-center font-medium hover:bg-red-50"
                                                >
                                                    {t('reviewPrompts.reject')}
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReviewPromptsList;
