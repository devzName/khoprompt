import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Input } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS, PROMPT_STATUS_COLORS, getStatusLabel } from '../constants/promptStatus';

const { Search } = Input;

const DashboardOverview = ({ 
  prompts = [], 
  loading = false,
  onEditPrompt,
  onDeletePrompt,
  onSubmitPrompt,
  onViewPrompt,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  pagination
}) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0
  });

  useEffect(() => {
    // Tính toán statistics từ prompts
    const newStats = {
      total: prompts.length,
      approved: prompts.filter(p => p.status === PROMPT_STATUS.APPROVED).length,
      pending: prompts.filter(p => p.status === PROMPT_STATUS.PENDING).length,
      rejected: prompts.filter(p => p.status === PROMPT_STATUS.REJECTED).length,
      draft: prompts.filter(p => p.status === PROMPT_STATUS.DRAFT).length
    };
    setStats(newStats);
  }, [prompts]);

  const columns = [
    {
      title: t('dashboard.table.title', 'Tiêu đề'),
      dataIndex: 'title',
      key: 'title',
      width: '30%',
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
      title: t('dashboard.table.category', 'Danh mục'),
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (category) => (
        <span className="text-sm text-gray-700">
          {category?.name || '-'}
        </span>
      ),
    },
    {
      title: t('dashboard.table.status', 'Trạng thái'),
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      align: 'center',
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
      title: t('dashboard.table.views', 'Lượt xem'),
      dataIndex: 'view_count',
      key: 'view_count',
      width: '10%',
      align: 'center',
      render: (count) => (
        <div className="flex items-center justify-center gap-1 text-gray-600 text-sm">
          <EyeOutlined className="text-gray-400" />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: t('dashboard.table.created', 'Ngày tạo'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: '13%',
      align: 'center',
      render: (date) => (
        <div className="text-xs text-gray-600">
          {new Date(date).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      title: t('dashboard.table.actions', 'Thao tác'),
      key: 'actions',
      width: '20%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewPrompt && onViewPrompt(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            Xem
          </Button>
          
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditPrompt && onEditPrompt(record)}
            disabled={record.status === PROMPT_STATUS.PENDING || record.status === PROMPT_STATUS.REJECTED}
            className="text-green-600 hover:text-green-700"
          >
            Sửa
          </Button>
          
          {record.status === PROMPT_STATUS.DRAFT && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => onSubmitPrompt && onSubmitPrompt(record.id)}
              className="text-purple-600 hover:text-purple-700"
            >
              Gửi
            </Button>
          )}
          
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeletePrompt && onDeletePrompt(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.subtitle', 'Quản lý và theo dõi prompts của bạn')}
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={t('dashboard.stats.total', 'Tổng số prompts')}
                value={stats.total}
                prefix={<FileTextOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={t('dashboard.stats.approved', 'Đã duyệt')}
                value={stats.approved}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={t('dashboard.stats.pending', 'Chờ duyệt')}
                value={stats.pending}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={t('dashboard.stats.draft', 'Bản nháp')}
                value={stats.draft}
                prefix={<FileTextOutlined className="text-gray-600" />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search Bar */}
        <div className="mb-4">
          <Search
            placeholder={t('dashboard.searchPlaceholder', 'Tìm kiếm prompts...')}
            value={searchValue}
            onChange={onSearchChange}
            onSearch={onSearchSubmit}
            size="large"
            allowClear
            className="max-w-md"
          />
        </div>

        {/* Prompts Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={prompts}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showTotal: (total) => `Tổng ${total} prompts`,
              showSizeChanger: false,
            }}
            scroll={{ x: 1000 }}
            className="dashboard-table"
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
