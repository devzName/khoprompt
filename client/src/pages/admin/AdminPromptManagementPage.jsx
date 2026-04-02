import { useState, useEffect } from 'react';
import { Spin, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import apiClient from '../../axios/apiClient';
import ApprovalToggle from '../../components/admin/approval-toggle';
import KanbanBoard from '../../components/admin/kanban-board';
import PromptManageList from '../../components/admin/prompt-manage-list';
import PageHeader from '../../components/shared/PageHeader';

const AdminPromptManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requireApproval, setRequireApproval] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  // Force list view on mobile regardless of approval setting
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Redirect non-admins
    if (user && user.user_type !== 'admin') {
      navigate(ROUTES.HOME);
    }
  }, [user, navigate]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
          placement: 'topRight',
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showKanban = requireApproval && !isMobile;

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title="Quản lý Prompt"
        description="Duyệt, từ chối và quản lý tất cả prompts trong hệ thống"
        breadcrumb="Quản lý Prompt"
      >
        <ApprovalToggle value={requireApproval} onChange={setRequireApproval} />
      </PageHeader>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          {isMobile && requireApproval && (
            <div className="mb-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Chế độ Kanban không khả dụng trên thiết bị di động. Đang hiển thị dạng danh sách.
            </div>
          )}
          {showKanban ? <KanbanBoard /> : <PromptManageList />}
        </div>
      </div>
    </div>
  );
};

export default AdminPromptManagementPage;
