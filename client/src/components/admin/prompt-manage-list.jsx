import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Select, Input, App, Tag, Space } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { promptService } from '../../services/promptService';

const { Option } = Select;
const { Search } = Input;

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'draft'];
const STATUS_COLOR = { pending: 'orange', approved: 'green', rejected: 'red', draft: 'default' };

// Simple list view for when approval mode is OFF
const PromptManageList = () => {
  const { modal, notification } = App.useApp();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: null });

  const fetchPrompts = useCallback(async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.pageSize };
      if (currentFilters.search?.trim()) params.search = currentFilters.search.trim();
      if (currentFilters.status) params.status = currentFilters.status;
      const res = await promptService.getAllPrompts(params);
      setPrompts(res.data || res);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: res.pagination?.total || (res.data || res).length,
      }));
    } catch {
      notification.error({ message: 'Không thể tải danh sách prompts', placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPrompts(1, filters); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (id) => {
    modal.confirm({
      title: 'Xóa prompt?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await promptService.deletePrompt(id);
          setPrompts((prev) => prev.filter((p) => p.id !== id));
          setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
          notification.success({ message: 'Đã xóa prompt', placement: 'topRight' });
        } catch {
          notification.error({ message: 'Không thể xóa prompt', placement: 'topRight' });
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (!selectedRowKeys.length) return;
    modal.confirm({
      title: `Xóa ${selectedRowKeys.length} prompt đã chọn?`,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa tất cả',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map((id) => promptService.deletePrompt(id)));
          setPrompts((prev) => prev.filter((p) => !selectedRowKeys.includes(p.id)));
          setSelectedRowKeys([]);
          notification.success({ message: `Đã xóa ${selectedRowKeys.length} prompt`, placement: 'topRight' });
        } catch {
          notification.error({ message: 'Xóa một số prompt thất bại', placement: 'topRight' });
        }
      },
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchPrompts(1, newFilters);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Tác giả',
      key: 'author',
      render: (_, r) => <span className="text-gray-600 dark:text-gray-400">@{r.user?.username || r.user?.email || '—'}</span>,
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s) => <Tag color={STATUS_COLOR[s] || 'default'}>{s}</Tag>,
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (_, r) => r.category?.name || '—',
      width: 120,
    },
    {
      title: 'AI Model',
      dataIndex: 'ai_model',
      key: 'ai_model',
      width: 110,
      render: (v) => v || '—',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          aria-label="Xóa prompt"
          onClick={() => handleDelete(r.id)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <Search
          placeholder="Tìm kiếm prompt..."
          allowClear
          prefix={<SearchOutlined />}
          onSearch={(v) => handleFilterChange('search', v)}
          onChange={(e) => !e.target.value && handleFilterChange('search', '')}
          style={{ maxWidth: 280 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ minWidth: 130 }}
          value={filters.status}
          onChange={(v) => handleFilterChange('status', v || null)}
        >
          {STATUS_OPTIONS.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Select>
        {selectedRowKeys.length > 0 && (
          <Space>
            <span className="text-sm text-gray-600 dark:text-gray-400">Đã chọn {selectedRowKeys.length}</span>
            <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
              Xóa đã chọn
            </Button>
          </Space>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#141414] rounded-lg border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={prompts}
        loading={loading}
        size="small"
        className="[&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: pagination.pageSize,
          showSizeChanger: false,
          showTotal: (t) => `Tổng ${t} prompts`,
          onChange: (page) => fetchPrompts(page),
        }}
        scroll={{ x: 700 }}
      />
      </div>
    </div>
  );
};

export default PromptManageList;
