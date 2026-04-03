import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Input, Button, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  FormOutlined,
  AppstoreOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PROMPT_STATUS } from '../constants/promptStatus';
import { ROUTES } from '../constants/routes';
import PromptsTable from './shared/PromptsTable';
import PageHeader from './shared/PageHeader';
import adminService from '../services/adminService';
const { Search } = Input;

/** Simple CSS bar chart — no extra library required. */
const LoginActivityChart = () => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    adminService
      .getAuditLogStats(30)
      .then((res) => setBars(res.data?.daily_logins ?? []))
      .catch(() => {});
  }, []);

  if (!bars.length) return null;

  const max = Math.max(...bars.map((b) => b.count), 1);

  return (
    <Card
      className="shadow-sm mb-6 dark:bg-[#141414] dark:border-gray-700"
      title="Login Activity (last 30 days)"
      extra={
        <Button
          type="link"
          size="small"
          href={ROUTES.ADMIN_AUDIT_LOGS}
          icon={<AuditOutlined />}
        >
          View audit logs
        </Button>
      }
    >
      <div className="flex items-end gap-0.5 h-20 overflow-x-auto">
        {bars.map((b) => (
          <Tooltip key={b.date} title={`${b.date}: ${b.count} login${b.count !== 1 ? 's' : ''}`}>
            <div
              className="flex-1 min-w-[6px] bg-blue-400 hover:bg-blue-600 rounded-t transition-colors cursor-default"
              style={{ height: `${Math.round((b.count / max) * 100)}%`, minHeight: b.count ? 2 : 0 }}
            />
          </Tooltip>
        ))}
      </div>
    </Card>
  );
};
const DashboardOverview = ({ 
  prompts = [], 
  loading = false,
  onEditPrompt,
  onDeletePrompt,
  onSubmitPrompt,
  onApprovePrompt,
  onRejectPrompt,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  pagination,
  onMenuClick,
  onTableChange,
  currentUser
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0
  });
  useEffect(() => {
    const newStats = {
      total: prompts.length,
      approved: prompts.filter(p => p.status === PROMPT_STATUS.APPROVED).length,
      pending: prompts.filter(p => p.status === PROMPT_STATUS.PENDING).length,
      rejected: prompts.filter(p => p.status === PROMPT_STATUS.REJECTED).length,
      draft: prompts.filter(p => p.status === PROMPT_STATUS.DRAFT).length
    };
    setStats(newStats);
  }, [prompts]);
  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('dashboard.title', 'Dashboard')}
        description={t('dashboard.subtitle', 'Quản lý và giám sát tất cả prompts trong hệ thống')}
        breadcrumb={t('dashboard.title', 'Dashboard')}
        onMenuClick={onMenuClick}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search
              placeholder={t('dashboard.searchPlaceholder', 'Tìm kiếm prompt...')}
              value={searchValue}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
              className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 shadow-sm"
              size="large"
              allowClear
            />
          </div>
          <Button
            type="primary"
            icon={<AppstoreOutlined />}
            onClick={() => navigate(ROUTES.ADMIN_PROMPTS)}
          >
            Quản lý Prompt
          </Button>
          {currentUser?.user_type === 'admin' && (
            <Button
              icon={<AuditOutlined />}
              onClick={() => navigate(ROUTES.ADMIN_AUDIT_LOGS)}
            >
              Audit Logs
            </Button>
          )}
        </div>
      </PageHeader>
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="w-full p-4 sm:p-6">
          {}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-[#141414] dark:border-gray-700">
                <Statistic
                  title={t('dashboard.stats.total', 'Tổng số prompts')}
                  value={stats.total}
                  prefix={<FolderOutlined style={{ color: '#1890ff' }} />}
                  styles={{ value: { color: '#1890ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-[#141414] dark:border-gray-700">
                <Statistic
                  title={t('dashboard.stats.approved', 'Đã duyệt')}
                  value={stats.approved}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  styles={{ value: { color: '#52c41a' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-[#141414] dark:border-gray-700">
                <Statistic
                  title={t('dashboard.stats.pending', 'Chờ duyệt')}
                  value={stats.pending}
                  prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                  styles={{ value: { color: '#fa8c16' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-[#141414] dark:border-gray-700">
                <Statistic
                  title={t('dashboard.stats.draft', 'Bản nháp')}
                  value={stats.draft}
                  prefix={<FormOutlined style={{ color: '#8c8c8c' }} />}
                  styles={{ value: { color: '#8c8c8c' } }}
                />
              </Card>
            </Col>
          </Row>
          {currentUser?.user_type === 'admin' && <LoginActivityChart />}
          <PromptsTable
            prompts={prompts}
            loading={loading}
            onSubmitPrompt={onSubmitPrompt}
            onEditPrompt={onEditPrompt}
            onDeletePrompt={onDeletePrompt}
            onApprovePrompt={onApprovePrompt}
            onRejectPrompt={onRejectPrompt}
            currentUser={currentUser}
            pagination={pagination}
            searchValue={searchValue}
            onTableChange={onTableChange}
          />
        </div>
      </div>
    </div>
  );
};
export default DashboardOverview;
