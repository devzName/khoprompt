import { useState, useEffect } from 'react';
import { Drawer, Form, Modal, Input, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';
import DashboardOverview from '../components/DashboardOverview';
import MyPromptsList from '../components/my-prompts/my-prompts-list';
import ManageCategoriesTags from '../components/ManageCategoriesTags';
import LoginManagement from '../components/LoginManagement';
import { PAGINATION } from '../constants/pagination';

const MyPromptsPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  // Reject reason modal state
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

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'create') {
      setActiveTab('create');
      setEditingPrompt(null);
      form.resetFields();
    } else if (tabFromUrl === 'dashboard' && user?.user_type === 'admin') {
      setActiveTab('dashboard');
    } else if (tabFromUrl === 'manage' && user?.user_type === 'admin') {
      setActiveTab('manage');
    } else if (tabFromUrl === 'login-management' && user?.user_type === 'admin') {
      setActiveTab('login-management');
    } else {
      setActiveTab('list');
    }
  }, [searchParams, form, user?.user_type]);

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

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    form.resetFields();
    setActiveTab('create');
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    form.setFieldsValue({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category_id,
      tags: prompt.tags?.map((tag) => (typeof tag === 'object' ? tag.id : tag).toString()) || [],
      notes: prompt.notes,
    });
    setActiveTab('create');
  };

  const handleSubmitPrompt = async (formData) => {
    try {
      setLoading(true);
      if (editingPrompt) {
        await promptService.updatePrompt(editingPrompt.id, formData);
        notification.success({ message: t('common.success'), description: t('myPrompts.editPrompt.success'), placement: 'topRight' });
      } else {
        await promptService.createPrompt(formData);
        notification.success({ message: t('common.success'), description: t('myPrompts.createPrompt.success'), placement: 'topRight' });
      }
      form.resetFields();
      setEditingPrompt(null);
      setActiveTab('list');
      navigate(ROUTES.MY_PROMPTS);
    } catch {
      notification.error({ message: t('common.error'), description: t('myPrompts.createPrompt.error'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleLogout = () => logout(() => setMobileMenuOpen(false));

  // Map MyPromptsPage activeTab values to sidebar item keys
  const sidebarActiveTab = activeTab === 'list' ? 'my-prompts'
    : activeTab === 'create' ? 'create-prompt'
    : activeTab; // 'dashboard', 'manage', 'login-management' already match keys

  const menuItems = useSidebarMenu(sidebarActiveTab, user, navigate, handleCreatePrompt, t);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="hidden lg:block">
        <Sidebar user={user} onLogout={handleLogout} menuItems={menuItems} activeTab={activeTab} />
      </div>
      <Drawer title={null} placement="left" onClose={() => setMobileMenuOpen(false)} open={mobileMenuOpen} className="lg:hidden" size={280} styles={{ body: { padding: 0 } }} closeIcon={null}>
        <Sidebar user={user} onLogout={handleLogout} onClose={() => setMobileMenuOpen(false)} menuItems={menuItems} activeTab={activeTab} isMobile={true} />
      </Drawer>
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
        ) : activeTab === 'list' ? (
          <MyPromptsList
            onCreatePrompt={handleCreatePrompt}
            onEditPrompt={handleEditPrompt}
            onMenuClick={() => setMobileMenuOpen(true)}
            currentUser={user}
          />
        ) : (
          <CreatePromptForm
            form={form}
            loading={loading}
            onSubmit={handleSubmitPrompt}
            onCancel={() => { setActiveTab('list'); navigate(ROUTES.MY_PROMPTS); }}
            onMenuClick={() => setMobileMenuOpen(true)}
            isEditing={!!editingPrompt}
            initialData={editingPrompt}
          />
        )}
      </div>

      {/* Rejection reason modal for dashboard tab */}
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
