import { useState, useEffect } from 'react';
import { Button, Tag, Modal, Table, Space, Card, Tooltip, notification } from 'antd';
import { PlusOutlined, EditOutlined, SendOutlined, FileTextOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS, PROMPT_STATUS_COLORS, getStatusLabel } from '../../constants/promptStatus';
import PromptDrawer from '../PromptDrawer';
import { promptService } from '../../services/promptService';
import { promptCategoriesService } from '../../services/promptCategoriesService';
import RejectionReasonDisplay from './rejection-reason-display';

const PromptsTable = ({
  prompts = [],
  loading = false,
  onSubmitPrompt,
  onEditPrompt,
  onDeletePrompt,
  onApprovePrompt,
  onRejectPrompt,
  onResubmitPrompt,
  onRefreshStats,
  currentUser,
  pagination = null,
  searchValue = '',
  onCreatePrompt,
  showCreateButton = false,
  onTableChange,
  mode = 'default', // 'default' | 'review' | 'personal'
}) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  // Clear selection when prompts list changes
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [prompts]);

  const handleQuickView = async (prompt) => {
    try {
      const detailedPrompt = await promptService.getPromptById(prompt.id);
      setSelectedPrompt(detailedPrompt);
      setDrawerOpen(true);
      setTimeout(() => {
        const drawerBody = document.querySelector('.ant-drawer-body');
        if (drawerBody) drawerBody.scrollTop = 0;
      }, 100);
    } catch {
      setSelectedPrompt(prompt);
      setDrawerOpen(true);
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

  const handleBulkDelete = () => {
    if (!selectedRowKeys.length) return;
    Modal.confirm({
      title: `Xóa ${selectedRowKeys.length} prompt đã chọn?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      async onOk() {
        setBulkDeleting(true);
        try {
          await Promise.all(selectedRowKeys.map((id) => promptService.deletePrompt(id)));
          notification.success({ message: t('common.success'), description: `Đã xóa ${selectedRowKeys.length} prompt`, placement: 'topRight' });
          setSelectedRowKeys([]);
          // Delegate refresh to parent handlers
          if (onDeletePrompt) onDeletePrompt(null); // signal bulk-done
          if (onRefreshStats) onRefreshStats();
        } catch {
          notification.error({ message: t('common.error'), description: 'Lỗi khi xóa hàng loạt', placement: 'topRight' });
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  };

  const categoryFilters = categories.map((cat) => ({ text: cat.name, value: cat.name }));
  const statusFilters = [
    { text: getStatusLabel(PROMPT_STATUS.DRAFT, t), value: PROMPT_STATUS.DRAFT },
    { text: getStatusLabel(PROMPT_STATUS.PENDING, t), value: PROMPT_STATUS.PENDING },
    { text: getStatusLabel(PROMPT_STATUS.APPROVED, t), value: PROMPT_STATUS.APPROVED },
    { text: getStatusLabel(PROMPT_STATUS.REJECTED, t), value: PROMPT_STATUS.REJECTED },
  ];

  const handleTableChange = (paginationConfig, filters, sorter) => {
    if (onTableChange) {
      const categoryFilter = filters.category?.[0] || null;
      const statusFilter = filters.status?.[0] || null;
      let sortBy = null;
      let sortOrder = null;
      if (sorter.order) {
        const sortFieldMap = { title: 'title', view_count: 'view_count', created_at: 'created_at' };
        sortBy = sortFieldMap[sorter.field] || null;
        sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      }
      onTableChange({ page: paginationConfig.current, category: categoryFilter, status: statusFilter, sortBy, sortOrder });
    }
  };

  // Expanded row for personal mode — shows rejection reason when status is rejected
  const expandedRowRender = mode === 'personal'
    ? (record) => {
        if (record.status !== PROMPT_STATUS.REJECTED || !record.rejection_reason) return null;
        return (
          <RejectionReasonDisplay
            reason={record.rejection_reason}
            onResubmit={() => onResubmitPrompt && onResubmitPrompt(record.id)}
          />
        );
      }
    : undefined;

  // Only expand rows that have rejection reasons (personal mode)
  const expandable = mode === 'personal'
    ? {
        expandedRowRender,
        rowExpandable: (record) => record.status === PROMPT_STATUS.REJECTED && !!record.rejection_reason,
        showExpandColumn: false, // auto-expand via defaultExpandedRowKeys
        defaultExpandAllRows: false,
      }
    : undefined;

  const columns = [
    {
      title: t('myPrompts.table.title', 'Tiêu đề'),
      dataIndex: 'title',
      key: 'title',
      width: '28%',
      sorter: true,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{text}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1">{record.description}</div>
          {/* Inline rejection display for personal mode when no expand column */}
          {mode === 'personal' && record.status === PROMPT_STATUS.REJECTED && record.rejection_reason && (
            <RejectionReasonDisplay
              reason={record.rejection_reason}
              onResubmit={() => onResubmitPrompt && onResubmitPrompt(record.id)}
            />
          )}
        </div>
      ),
    },
    {
      title: t('myPrompts.table.category', 'Danh mục'),
      dataIndex: 'category',
      key: 'category',
      width: '14%',
      filters: categoryFilters,
      filterMultiple: false,
      render: (category) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{category?.name || '-'}</span>
      ),
    },
    {
      title: t('myPrompts.table.status', 'Trạng thái'),
      dataIndex: 'status',
      key: 'status',
      width: '11%',
      align: 'center',
      filters: statusFilters,
      filterMultiple: false,
      render: (status) => (
        <Tag color={PROMPT_STATUS_COLORS[status] || 'default'} className="rounded-full px-3 py-1 text-xs font-medium">
          {getStatusLabel(status, t)}
        </Tag>
      ),
    },
    {
      title: t('myPrompts.table.views', 'Lượt xem'),
      dataIndex: 'view_count',
      key: 'view_count',
      width: '9%',
      align: 'center',
      sorter: true,
      render: (count) => (
        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
          <EyeOutlined className="text-gray-400" />
          <span>{count || 0}</span>
        </div>
      ),
    },
    // Vote stats columns — shown in personal and review modes
    ...(mode === 'personal' || mode === 'review'
      ? [
          {
            title: <Tooltip title="Hữu ích"><LikeOutlined /></Tooltip>,
            dataIndex: 'like_count',
            key: 'like_count',
            width: '7%',
            align: 'center',
            render: (count) => (
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <LikeOutlined />
                <span>{count || 0}</span>
              </div>
            ),
          },
          {
            title: <Tooltip title="Không hữu ích"><DislikeOutlined /></Tooltip>,
            dataIndex: 'dislike_count',
            key: 'dislike_count',
            width: '7%',
            align: 'center',
            render: (count) => (
              <div className="flex items-center justify-center gap-1 text-red-400 text-sm">
                <DislikeOutlined />
                <span>{count || 0}</span>
              </div>
            ),
          },
        ]
      : []),
    {
      title: t('myPrompts.table.created', 'Ngày tạo'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: '12%',
      align: 'center',
      sorter: true,
      render: (date) => (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {new Date(date).toLocaleDateString('vi-VN')}{' '}
          {new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      ),
    },
    {
      title: t('myPrompts.table.actions', 'Thao tác'),
      key: 'actions',
      width: '18%',
      align: 'center',
      render: (_, record) => {
        if (mode === 'review') {
          return (
            <Space size="small">
              <Tooltip title={t('common.view', 'Xem')}>
                <Button type="link" size="small" icon={<EyeOutlined />} aria-label="Xem prompt" onClick={() => handleQuickView(record)} className="text-blue-600 hover:text-blue-700" />
              </Tooltip>
              <Tooltip title={t('reviewPrompts.approve', 'Duyệt')}>
                <Button type="link" size="small" icon={<CheckOutlined />} aria-label="Duyệt prompt" onClick={() => onApprovePrompt && onApprovePrompt(record.id)} className="text-green-600 hover:text-green-700" />
              </Tooltip>
              <Tooltip title={t('reviewPrompts.reject', 'Từ chối')}>
                <Button type="link" size="small" danger icon={<CloseOutlined />} aria-label="Từ chối prompt" onClick={() => onRejectPrompt && onRejectPrompt(record.id)} />
              </Tooltip>
            </Space>
          );
        }
        return (
          <Space size="small">
            <Tooltip title={t('common.view', 'Xem')}>
              <Button type="link" size="small" icon={<EyeOutlined />} aria-label="Xem chi tiết prompt" onClick={() => handleQuickView(record)} className="text-blue-600 hover:text-blue-700" />
            </Tooltip>
            <Tooltip title={t('common.edit', 'Sửa')}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                aria-label="Chỉnh sửa prompt"
                onClick={() => onEditPrompt && onEditPrompt(record)}
                disabled={record.status === PROMPT_STATUS.PENDING || record.status === PROMPT_STATUS.REJECTED}
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
            {record.status === PROMPT_STATUS.DRAFT && (
              <Tooltip title={t('myPrompts.submitForReview', 'Gửi duyệt')}>
                <Button type="link" size="small" icon={<SendOutlined />} aria-label="Gửi duyệt prompt" onClick={() => onSubmitPrompt && onSubmitPrompt(record.id)} className="text-purple-600 hover:text-purple-700" />
              </Tooltip>
            )}
            <Tooltip title={t('myPrompts.delete', 'Xóa')}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} aria-label="Xóa prompt" onClick={() => handleDeletePrompt(record.id)} />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // Row selection config for personal mode
  const rowSelection = mode === 'personal'
    ? {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
        getCheckboxProps: () => ({ 'aria-label': 'Chọn prompt này' }),
      }
    : undefined;

  return (
    <>
      {/* Bulk action toolbar — only in personal mode */}
      {mode === 'personal' && selectedRowKeys.length > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Đã chọn {selectedRowKeys.length} prompt</span>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={bulkDeleting}
            onClick={handleBulkDelete}
            aria-label={`Xóa ${selectedRowKeys.length} prompt đã chọn`}
          >
            Xóa đã chọn ({selectedRowKeys.length})
          </Button>
          <Button size="small" onClick={() => setSelectedRowKeys([])} aria-label="Bỏ chọn tất cả">
            Bỏ chọn
          </Button>
        </div>
      )}
      <Card className="shadow-sm dark:bg-[#141414] dark:border-gray-700">
        <Table
          columns={columns}
          dataSource={prompts}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          expandable={expandable}
          pagination={{
            ...pagination,
            showTotal: (total) => t('myPrompts.table.total', `Tổng ${total} prompts`, { total }),
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          className="prompts-table"
          rowClassName="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
          locale={{
            emptyText: (
              <div className="py-12">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <FileTextOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                  <div className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {searchValue ? t('myPrompts.noResults') : t('myPrompts.noPrompts')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {searchValue ? t('myPrompts.noResultsDescription') : t('myPrompts.noPromptsDescription')}
                  </div>
                  {!searchValue && showCreateButton && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onCreatePrompt} size="large" className="rounded-xl" aria-label="Tạo prompt mới">
                      {t('myPrompts.createPrompt.title')}
                    </Button>
                  )}
                </div>
              </div>
            ),
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
