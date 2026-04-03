import { useState, useEffect } from 'react';
import { Drawer, Spin, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { useSidebarMenu } from '../../hooks/use-sidebar-menu.jsx';
import apiClient from '../../axios/apiClient';
import ApprovalToggle from '../../components/admin/approval-toggle';
import KanbanBoard from '../../components/admin/kanban-board';
import PromptManageList from '../../components/admin/prompt-manage-list';
import PageHeader from '../../components/shared/PageHeader';
import Sidebar from '../../components/Sidebar';

const AdminPromptManagementPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requireApproval, setRequireApproval] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Force list view on mobile regardless of approval setting
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Redirect non-admins
    if (user && user.user_type !== 'admin') {
      navigate(ROUTES.HOME);
    }
  }, [user, navigate]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // set on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      try {
        const res = await apiClient.get('/admin/settings');
        const val = res.data?.require_approval?.value;
        setRequireApproval(val === 'true' || val === true);
      } catch {
        notification.error({
          message: 'Không thể tải cài đặt',
          description: 'Vui lòng tải lại trang hoặc liên hệ quản trị viên.',
          placement: 'topRight',
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => logout(() => setMobileMenuOpen(false));

  const menuItems = useSidebarMenu('admin-prompts', user, navigate, null, t);

  const showKanban = requireApproval && !isMobile;

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} onLogout={handleLogout} menuItems={menuItems} activeTab="admin-prompts" />
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
          activeTab="admin-prompts"
          isMobile={true}
        />
      </Drawer>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title="Quản lý Prompt"
          description="Duyệt, từ chối và quản lý tất cả prompts trong hệ thống"
          breadcrumb="Quản lý Prompt"
          onMenuClick={() => setMobileMenuOpen(true)}
        >
          <ApprovalToggle value={requireApproval} onChange={setRequireApproval} />
        </PageHeader>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="w-full p-4 sm:p-6">
            {isMobile && requireApproval && (
              <div className="mb-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg px-3 py-2">
                Chế độ Kanban không khả dụng trên thiết bị di động. Đang hiển thị dạng danh sách.
              </div>
            )}
            {showKanban ? <KanbanBoard /> : <PromptManageList />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromptManagementPage;
