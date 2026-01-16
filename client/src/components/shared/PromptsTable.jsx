import { useState, useEffect } from 'react';
import { Button, Tag, Modal, Table, Space, Card, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, SendOutlined, FileTextOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS, PROMPT_STATUS_COLORS, getStatusLabel } from '../../constants/promptStatus';
import PromptDrawer from '../PromptDrawer';
import { promptService } from '../../services/promptService';
import { promptCategoriesService } from '../../services/promptCategoriesService';

const PromptsTable = ({
  prompts = [],
  loading = false,
  onSubmitPrompt,
  onEditPrompt,
  onDeletePrompt,
  onApprovePrompt,
  onRejectPrompt,
  currentUser,
  pagination = null,
  searchValue = '',
  onCreatePrompt,
  showCreateButton = false,
  onTableChange,
  mode = 'default' // 'default' or 'review'
}) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await promptCategoriesService.getCategoriesStats();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleQuickView = async (prompt) => {
    try {
      const detailedPrompt = await promptService.getPromptById(prompt.id);
      setSelectedPrompt(detailedPrompt);
      setDrawerOpen(true);
      setTimeout(() => {
        const drawerBody = document.querySelector('.ant-drawer-body');
        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to fetch prompt details:', error);
      setSelectedPrompt(prompt);
      setDrawerOpen(true);
      setTimeout(() => {
        const drawerBody = document.querySelector('.ant-drawer-body');
        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      }, 100);
    }
  };

  const handleDeletePrompt = (promptId) => {
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

  // Get categories from API for filter
  const categoryFilters = categories.map(cat => ({ 
    text: cat.name, 
    value: cat.name 
  }));

  // All available status filters (not just from current prompts)
  const statusFilters = [
    { text: getStatusLabel(PROMPT_STATUS.DRAFT, t), value: PROMPT_STATUS.DRAFT },
    { text: getStatusLabel(PROMPT_STATUS.PENDING, t), value: PROMPT_STATUS.PENDING },
    { text: getStatusLabel(PROMPT_STATUS.APPROVED, t), value: PROMPT_STATUS.APPROVED },
    { text: getStatusLabel(PROMPT_STATUS.REJECTED, t), value: PROMPT_STATUS.REJECTED }
  ];

  const handleTableChange = (paginationConfig, filters, sorter) => {
    if (onTableChange) {
      // Extract filter values
      const categoryFilter = filters.category?.[0] || null;
      const statusFilter = filters.status?.[0] || null;
      
      // Extract sort values
      let sortBy = null;
      let sortOrder = null;
      
      if (sorter.order) {
        // Map column key to API field name
        const sortFieldMap = {
          'title': 'title',
          'view_count': 'view_count',
          'created_at': 'created_at'
        };
        
        sortBy = sortFieldMap[sorter.field] || null;
        sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      }
      
      onTableChange({
        page: paginationConfig.current,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      });
    }
  };

  const columns = [
    {
      title: t('myPrompts.table.title', 'Tiêu đề'),
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      sorter: true,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-900 text-sm mb-1">
            {text}
          </div>
          <div className="text-gray-500 text-xs line-clamp-1">
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: t('myPrompts.table.category', 'Danh mục'),
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      filters: categoryFilters,
      filterMultiple: false,
      render: (category) => (
        <span className="text-sm text-gray-700">
          {category?.name || '-'}
        </span>
      ),
    },
    {
      title: t('myPrompts.table.status', 'Trạng thái'),
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      align: 'center',
      filters: statusFilters,
      filterMultiple: false,
      render: (status) => (
        <Tag 
          color={PROMPT_STATUS_COLORS[status] || 'default'}
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          {getStatusLabel(status, t)}
        </Tag>
      ),
    },
    {
      title: t('myPrompts.table.views', 'Lượt xem'),
      dataIndex: 'view_count',
      key: 'view_count',
      width: '10%',
      align: 'center',
      sorter: true,
      render: (count) => (
        <div className="flex items-center justify-center gap-1 text-gray-600 text-sm">
          <EyeOutlined className="text-gray-400" />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: t('myPrompts.table.created', 'Ngày tạo'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: '13%',
      align: 'center',
      sorter: true,
      render: (date) => (
        <div className="text-xs text-gray-600">
          {new Date(date).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      title: t('myPrompts.table.actions', 'Thao tác'),
      key: 'actions',
      width: '20%',
      align: 'center',
      render: (_, record) => {
        if (mode === 'review') {
          // Review mode actions
          return (
            <Space size="small">
              <Tooltip title={t('common.view', 'Xem')}>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleQuickView(record)}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>
              
              <Tooltip title={t('reviewPrompts.approve', 'Duyệt')}>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => onApprovePrompt && onApprovePrompt(record.id)}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>
              
              <Tooltip title={t('reviewPrompts.reject', 'Từ chối')}>
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => onRejectPrompt && onRejectPrompt(record.id)}
                />
              </Tooltip>
            </Space>
          );
        }
        
        // Default mode actions
        return (
          <Space size="small">
            <Tooltip title={t('common.view', 'Xem')}>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleQuickView(record)}
                className="text-blue-600 hover:text-blue-700"
              />
            </Tooltip>
            
            <Tooltip title={t('common.edit', 'Sửa')}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditPrompt && onEditPrompt(record)}
                disabled={record.status === PROMPT_STATUS.PENDING || record.status === PROMPT_STATUS.REJECTED}
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
            
            {record.status === PROMPT_STATUS.DRAFT && (
              <Tooltip title={t('myPrompts.submitForReview', 'Gửi duyệt')}>
                <Button
                  type="link"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => onSubmitPrompt && onSubmitPrompt(record.id)}
                  className="text-purple-600 hover:text-purple-700"
                />
              </Tooltip>
            )}
            
            <Tooltip title={t('myPrompts.delete', 'Xóa')}>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeletePrompt(record.id)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={prompts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total) => t('myPrompts.table.total', `Tổng ${total} prompts`, { total }),
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="prompts-table"
          rowClassName="hover:bg-gray-50 transition-colors"
          locale={{
            emptyText: (
              <div className="py-12">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <FileTextOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                  <div className="text-lg font-medium text-gray-600 mb-2">
                    {searchValue ? t('myPrompts.noResults') : t('myPrompts.noPrompts')}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {searchValue ? t('myPrompts.noResultsDescription') : t('myPrompts.noPromptsDescription')}
                  </div>
                  {!searchValue && showCreateButton && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={onCreatePrompt}
                      size="large"
                      className="rounded-xl"
                    >
                      {t('myPrompts.createPrompt.title')}
                    </Button>
                  )}
                </div>
              </div>
            )
          }}
        />
      </Card>

      <PromptDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prompt={selectedPrompt}
        currentUser={currentUser}
        onApprove={onApprovePrompt}
        onReject={onRejectPrompt}
      />
    </>
  );
};

export default PromptsTable;
