import { useState, useEffect, useCallback } from 'react';
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import adminService from '../../services/adminService';
import AuditLogTable from './audit-log-table';
import UserActivityDrawer from './user-activity-drawer';
import PageHeader from '../../components/shared/PageHeader';
import AdminLayout from '../../components/layouts/AdminLayout';

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

const AuditLogPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [page, setPage] = useState(DEFAULT_PAGE);
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
      if (!query.action) delete query.action;
      const res = await adminService.getAuditLogs(query);
      setData(res.data);
    } catch {
      // silently fail — table shows empty state
    } finally {
      setLoading(false);
    }
  }, [page, action, dateRange]);

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
    <AdminLayout activeTab="audit-logs">
      {({ onMenuClick }) => (
        <>
          <PageHeader
            title="Audit Logs"
            description="Theo dõi tất cả các hoạt động quan trọng trong hệ thống"
            breadcrumb="Audit Logs"
            onMenuClick={onMenuClick}
          />
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0d0d0d] p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Select
                value={action}
                onChange={handleActionChange}
                options={ACTION_OPTIONS}
                style={{ width: 180 }}
                placeholder="Filter by action"
                aria-label="Lọc theo hành động"
                size="small"
              />
              <RangePicker
                value={dateRange.map((d) => (d ? dayjs(d) : null))}
                onChange={handleDateChange}
                allowEmpty={[true, true]}
                aria-label="Lọc theo khoảng thời gian"
                size="small"
              />
            </div>
            <div className="bg-white dark:bg-[#141414] rounded-lg border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              <AuditLogTable
                data={data}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                onRowClick={(record) => setDrawerUserId(record.user_id)}
              />
            </div>
          </div>
          <UserActivityDrawer
            userId={drawerUserId}
            onClose={() => setDrawerUserId(null)}
          />
        </>
      )}
    </AdminLayout>
  );
};

export default AuditLogPage;
