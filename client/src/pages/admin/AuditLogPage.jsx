import { useState, useEffect, useCallback } from 'react';
import { Select, DatePicker, Card, Space, Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import adminService from '../../services/adminService';
import AuditLogTable from './audit-log-table';
import UserActivityDrawer from './user-activity-drawer';
import { ROUTES } from '../../constants/routes';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login_success', label: 'Login success' },
  { value: 'login_failed', label: 'Failed login' },
  { value: 'logout', label: 'Logout' },
  { value: 'password_change', label: 'Password change' },
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

/**
 * Admin page: paginated, filterable audit log viewer.
 * Row click opens UserActivityDrawer for that user.
 */
const AuditLogPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [action, setAction] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [page, setPage] = useState(DEFAULT_PAGE);

  // Drawer state
  const [drawerUserId, setDrawerUserId] = useState(null);

  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = {
        page: params.page ?? page,
        limit: DEFAULT_LIMIT,
        ...(params.action ?? action ? { action: params.action ?? action } : {}),
        ...(dateRange[0] ? { from_date: dateRange[0].toISOString() } : {}),
        ...(dateRange[1] ? { to_date: dateRange[1].toISOString() } : {}),
        ...params,
      };
      // Remove empty string action
      if (!query.action) delete query.action;
      const res = await adminService.getAuditLogs(query);
      setData(res.data);
    } catch {
      // silently fail — table shows empty state
    } finally {
      setLoading(false);
    }
  }, [page, action, dateRange]);

  // Initial load
  useEffect(() => {
    fetchLogs({ page: DEFAULT_PAGE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActionChange = (val) => {
    setAction(val);
    setPage(DEFAULT_PAGE);
    fetchLogs({ action: val, page: DEFAULT_PAGE });
  };

  const handleDateChange = (dates) => {
    const range = dates ?? [null, null];
    setDateRange(range);
    setPage(DEFAULT_PAGE);
    fetchLogs({
      page: DEFAULT_PAGE,
      from_date: range[0] ? range[0].startOf('day').toISOString() : undefined,
      to_date: range[1] ? range[1].endOf('day').toISOString() : undefined,
    });
  };

  const handleTableChange = (pag) => {
    const nextPage = pag.current ?? DEFAULT_PAGE;
    setPage(nextPage);
    fetchLogs({ page: nextPage });
  };

  const pagination = {
    current: data?.page ?? DEFAULT_PAGE,
    pageSize: DEFAULT_LIMIT,
    total: data?.total ?? 0,
    showSizeChanger: false,
    showTotal: (total) => `${total} entries`,
  };

  const breadcrumbItems = [
    { title: <Link to={ROUTES.HOME}><HomeOutlined /></Link> },
    { title: 'Audit Logs' },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} className="mb-3" />
      <Title level={4} className="mb-4">Audit Logs</Title>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Space wrap>
          <Select
            value={action}
            onChange={handleActionChange}
            options={ACTION_OPTIONS}
            style={{ width: 180 }}
            placeholder="Filter by action"
          />
          <RangePicker
            value={dateRange.map((d) => (d ? dayjs(d) : null))}
            onChange={handleDateChange}
            allowEmpty={[true, true]}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card className="shadow-sm">
        <AuditLogTable
          data={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onRowClick={(record) => setDrawerUserId(record.user_id)}
        />
      </Card>

      {/* User activity drawer */}
      <UserActivityDrawer
        userId={drawerUserId}
        onClose={() => setDrawerUserId(null)}
      />
    </div>
  );
};

export default AuditLogPage;
