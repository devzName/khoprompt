import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Input } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  FolderOutlined,
  FormOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PROMPT_STATUS } from '../constants/promptStatus';
import PromptsTable from './shared/PromptsTable';
import PageHeader from './shared/PageHeader';

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
  pagination,
  onMenuClick,
  onTableChange
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

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('dashboard.title', 'Dashboard')}
        description={t('dashboard.subtitle', 'Quản lý và theo dõi prompts của bạn')}
        breadcrumb={t('dashboard.title', 'Dashboard')}
        onMenuClick={onMenuClick}
      >
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
      </PageHeader>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={t('dashboard.stats.total', 'Tổng số prompts')}
                  value={stats.total}
                  prefix={<FolderOutlined style={{ color: '#1890ff' }} />}
                  styles={{ value: { color: '#1890ff' } }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={t('dashboard.stats.approved', 'Đã duyệt')}
                  value={stats.approved}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  styles={{ value: { color: '#52c41a' } }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={t('dashboard.stats.pending', 'Chờ duyệt')}
                  value={stats.pending}
                  prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                  styles={{ value: { color: '#fa8c16' } }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={t('dashboard.stats.draft', 'Bản nháp')}
                  value={stats.draft}
                  prefix={<FormOutlined style={{ color: '#8c8c8c' }} />}
                  styles={{ value: { color: '#8c8c8c' } }}
                />
              </Card>
            </Col>
          </Row>

          {/* Prompts Table */}
          <PromptsTable
            prompts={prompts}
            loading={loading}
            onSubmitPrompt={onSubmitPrompt}
            onEditPrompt={onEditPrompt}
            onDeletePrompt={onDeletePrompt}
            onViewPrompt={onViewPrompt}
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
