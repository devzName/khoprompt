import { useState, useEffect, useCallback } from 'react';
import { Drawer, Select, DatePicker, Card, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { useSidebarMenu } from '../../hooks/use-sidebar-menu.jsx';
import adminService from '../../services/adminService';
import AuditLogTable from './audit-log-table';
import UserActivityDrawer from './user-activity-drawer';
import PageHeader from '../../components/shared/PageHeader';
import Sidebar from '../../components/Sidebar';

const { RangePicker } = DatePicker;

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
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [action, setAction] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [page, setPage] = useState(DEFAULT_PAGE);

  // Drawer state
  const [drawerUserId, setDrawerUserId] = useState(null);

  const handleLogout = () => logout(() => setMobileMenuOpen(false));

  const menuItems = useSidebarMenu('audit-logs', user, navigate, null, t);

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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} onLogout={handleLogout} menuItems={menuItems} activeTab="audit-logs" />
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="lg:hidden"
        size={280}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onClose={() => setMobileMenuOpen(false)}
          menuItems={menuItems}
          activeTab="audit-logs"
          isMobile={true}
        />
      </Drawer>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Audit Logs"
          description="Theo dõi tất cả các hoạt động quan trọng trong hệ thống"
          breadcrumb="Audit Logs"
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Filters */}
          <Card className="mb-4 shadow-sm dark:bg-[#141414] dark:border-gray-700">
            <Space wrap>
              <Select
                value={action}
                onChange={handleActionChange}
                options={ACTION_OPTIONS}
                style={{ width: 180 }}
                placeholder="Filter by action"
                aria-label="Lọc theo hành động"
              />
              <RangePicker
                value={dateRange.map((d) => (d ? dayjs(d) : null))}
                onChange={handleDateChange}
                allowEmpty={[true, true]}
                aria-label="Lọc theo khoảng thời gian"
              />
            </Space>
          </Card>

          {/* Table */}
          <Card className="shadow-sm dark:bg-[#141414] dark:border-gray-700">
            <AuditLogTable
              data={data}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              onRowClick={(record) => setDrawerUserId(record.user_id)}
            />
          </Card>
        </div>
      </div>

      {/* User activity drawer */}
      <UserActivityDrawer
        userId={drawerUserId}
        onClose={() => setDrawerUserId(null)}
      />
    </div>
  );
};

export default AuditLogPage;
