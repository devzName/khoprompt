/**
 * My Prompts dashboard page — list, dashboard, manage, login-management tabs.
 * Create/Edit prompt is now a separate route: /my-prompts/create and /my-prompts/:id/edit
 */
import { useState, useEffect } from 'react';
import { Drawer, Modal, Input, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import MyPromptsList from '../components/my-prompts/my-prompts-list';
import ManageCategoriesTags from '../components/ManageCategoriesTags';
import LoginManagement from '../components/LoginManagement';
import { PAGINATION } from '../constants/pagination';

const MyPromptsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Shared loading for approve/reject actions
  const [loading, setLoading] = useState(false);

  // Reject reason modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Admin dashboard state
  const [allPrompts, setAllPrompts] = useState([]);
  const [totalAllPrompts, setTotalAllPrompts] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardCurrentPage, setDashboardCurrentPage] = useState(1);
  const [dashboardFilters, setDashboardFilters] = useState({ category: null, status: null });
  const [dashboardSorter, setDashboardSorter] = useState({ sortBy: 'created_at', sortOrder: 'desc' });
  const [dashboardSearch, setDashboardSearch] = useState('');

  // Sync active tab from URL query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'dashboard' && user?.user_type === 'admin') setActiveTab('dashboard');
    else if (tab === 'manage' && user?.user_type === 'admin') setActiveTab('manage');
    else if (tab === 'login-management' && user?.user_type === 'admin') setActiveTab('login-management');
    else setActiveTab('list');
  }, [searchParams, user?.user_type]);

  useEffect(() => {
    if (user?.user_type === 'admin' && activeTab === 'dashboard') {
      fetchAllPrompts(1, '', { category: null, status: null }, { sortBy: 'created_at', sortOrder: 'desc' });
    }
  }, [user?.user_type, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllPrompts = async (page, search = '', filterParams = dashboardFilters, sortParams = dashboardSorter) => {
    setDashboardLoading(true);
    try {
      const params = { page, limit: PAGINATION.PAGE_SIZE };
      if (search?.trim()) params.search = search.trim();
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.status) params.status = filterParams.status;
      if (sortParams.sortBy) { params.sort_by = sortParams.sortBy; params.sort_order = sortParams.sortOrder; }
      const response = await promptService.getAllPrompts(params);
      setAllPrompts(response.data || response);
      setTotalAllPrompts(response.pagination?.total || response.length);
    } catch {
      notification.error({ message: t('common.error'), description: t('dashboard.errorFetching'), placement: 'topRight' });
    } finally {
      setDashboardLoading(false);
    }
  };

  // Navigate to the dedicated create/edit page
  const handleCreatePrompt = () => navigate(ROUTES.MY_PROMPTS_CREATE);
  const handleEditPrompt = (prompt) => navigate(ROUTES.MY_PROMPTS_EDIT(prompt.id));

  const handleApprovePrompt = async (id) => {
    try {
      setLoading(true);
      await promptService.approvePrompt(id);
      notification.success({ message: t('common.success'), description: t('reviewPrompts.approveSuccess'), placement: 'topRight' });
      fetchAllPrompts(dashboardCurrentPage, dashboardSearch);
    } catch {
      notification.error({ message: t('common.error'), description: t('reviewPrompts.approveError'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPrompt = (id) => {
    setRejectTargetId(id);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      notification.error({ message: 'Lý do từ chối phải có ít nhất 10 ký tự', placement: 'topRight' });
      return;
    }
    try {
      setLoading(true);
      await promptService.rejectPrompt(rejectTargetId, rejectReason.trim());
      notification.success({ message: t('common.success'), description: t('reviewPrompts.rejectSuccess'), placement: 'topRight' });
      setRejectModalVisible(false);
      fetchAllPrompts(dashboardCurrentPage, dashboardSearch);
    } catch {
      notification.error({ message: t('common.error'), description: t('reviewPrompts.rejectError'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardTableChange = (tableFilters) => {
    const newPage = tableFilters.page || 1;
    const newFilters = { category: tableFilters.category, status: tableFilters.status };
    const newSorter = { sortBy: tableFilters.sortBy || 'created_at', sortOrder: tableFilters.sortOrder || 'desc' };
    setDashboardCurrentPage(newPage);
    setDashboardFilters(newFilters);
    setDashboardSorter(newSorter);
    fetchAllPrompts(newPage, dashboardSearch, newFilters, newSorter);
  };

  // Map tab value to sidebar item key
  const sidebarActiveTab = activeTab === 'list' ? 'my-prompts' : activeTab;
  const menuItems = useSidebarMenu(sidebarActiveTab, user, navigate, handleCreatePrompt, t);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-[#0d0d0d]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar menuItems={menuItems} activeTab={sidebarActiveTab} />
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={208}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar
          menuItems={menuItems}
          activeTab={sidebarActiveTab}
          isMobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'manage' && user?.user_type === 'admin' ? (
          <ManageCategoriesTags onMenuClick={() => setMobileMenuOpen(true)} />
        ) : activeTab === 'login-management' && user?.user_type === 'admin' ? (
          <LoginManagement onMenuClick={() => setMobileMenuOpen(true)} />
        ) : activeTab === 'dashboard' && user?.user_type === 'admin' ? (
          <DashboardOverview
            prompts={allPrompts}
            loading={dashboardLoading}
            searchValue={dashboardSearch}
            onSearchChange={(e) => setDashboardSearch(e.target.value)}
            onSearchSubmit={(v) => { setDashboardSearch(v); setDashboardCurrentPage(1); fetchAllPrompts(1, v); }}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={(id) => { promptService.deletePrompt(id).then(() => fetchAllPrompts(dashboardCurrentPage, dashboardSearch)); }}
            onSubmitPrompt={async (id) => { await promptService.submitPrompt(id); fetchAllPrompts(dashboardCurrentPage, dashboardSearch); }}
            onApprovePrompt={handleApprovePrompt}
            onRejectPrompt={handleRejectPrompt}
            currentUser={user}
            onMenuClick={() => setMobileMenuOpen(true)}
            onTableChange={handleDashboardTableChange}
            pagination={{ current: dashboardCurrentPage, total: totalAllPrompts, pageSize: PAGINATION.PAGE_SIZE }}
          />
        ) : (
          <MyPromptsList
            onCreatePrompt={handleCreatePrompt}
            onEditPrompt={handleEditPrompt}
            onMenuClick={() => setMobileMenuOpen(true)}
            currentUser={user}
          />
        )}
      </div>

      {/* Reject reason modal */}
      <Modal
        title="Lý do từ chối"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading }}
      >
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối (ít nhất 10 ký tự)"
          rows={4}
          maxLength={500}
          showCount
        />
      </Modal>
    </div>
  );
};

export default MyPromptsPage;
