import { useState } from 'react';
import {
    EyeOutlined,
    DeleteOutlined,
    InboxOutlined,
    MoreOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Input, Space, Tooltip, Popconfirm, Dropdown } from 'antd';
import { ROUTES } from '../../constants/routes';
import PageHeader from '../shared/PageHeader';

const ManagePromptsList = ({
    prompts,
    loading,
    searchValue,
    setSearchValue,
    onMenuClick,
    handleDelete,
    handleArchive
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const getStatusColor = (state) => {
        switch (state) {
            case 'DRAFT': return 'default';
            case 'SUBMITTED': return 'gold';
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'red';
            case 'ARCHIVED': return 'purple';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: t('common.title'),
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 line-clamp-1">{text}</span>
                    <span className="text-xs text-gray-500 line-clamp-1">{record.description}</span>
                </div>
            ),
        },
        {
            title: t('common.category'),
            dataIndex: ['categoryInfo', 'name'],
            key: 'category',
            responsive: ['md'],
            render: (text, record) => (
                <Tag>{text || record.category}</Tag>
            )
        },
        {
            title: t('common.author'),
            dataIndex: 'author',
            key: 'author',
            responsive: ['sm'],
            render: (text) => <span className="text-gray-600">{text}</span>
        },
        {
            title: t('common.status'),
            dataIndex: 'state',
            key: 'state',
            width: 120,
            render: (state) => (
                <Tag color={getStatusColor(state)}>
                    {t(`myPrompts.status.${state}`)}
                </Tag>
            ),
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title={t('common.view')}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(ROUTES.PROMPT_DETAIL_PATH(record.id))}
                        />
                    </Tooltip>

                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'archive',
                                    label: t('common.archive'),
                                    icon: <InboxOutlined />,
                                    disabled: record.state === 'ARCHIVED',
                                    onClick: () => handleArchive(record.id)
                                },
                                {
                                    key: 'delete',
                                    label: t('common.delete'),
                                    icon: <DeleteOutlined />,
                                    danger: true,
                                    onClick: () => { }, // Handled by Popconfirm wrapper if possible, or use modal
                                }
                            ].map(item => {
                                if (item.key === 'delete') {
                                    return {
                                        ...item,
                                        label: (
                                            <Popconfirm
                                                title={t('common.confirmDelete')}
                                                onConfirm={() => handleDelete(record.id)}
                                                okText={t('common.yes')}
                                                cancelText={t('common.no')}
                                            >
                                                <div className="w-full h-full">{item.label}</div>
                                            </Popconfirm>
                                        ),
                                        onClick: undefined // Prevent double trigger
                                    }
                                }
                                return item;
                            })
                        }}
                        trigger={['click']}
                    >
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            <PageHeader
                title={t('header.managePrompts')}
                breadcrumb={t('header.managePrompts')}
                onMenuClick={onMenuClick}
            >
                <Input
                    placeholder={t('header.search')}
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full sm:w-64"
                    allowClear
                />
            </PageHeader>

            <div className="flex-1 overflow-hidden p-4 sm:p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                    <Table
                        dataSource={prompts}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            total: prompts.length, // Client-side pagination for now as API doesn't return total
                        }}
                        scroll={{ x: 800, y: 'calc(100vh - 280px)' }}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
};

export default ManagePromptsList;
