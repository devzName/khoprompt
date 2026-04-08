import { useState, useEffect } from 'react';
import { Spin, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import apiClient from '../../axios/apiClient';
import ApprovalToggle from '../../components/admin/approval-toggle';
import KanbanBoard from '../../components/admin/kanban-board';
import PromptManageList from '../../components/admin/prompt-manage-list';
import PageHeader from '../../components/shared/PageHeader';
import AdminLayout from '../../components/layouts/AdminLayout';

const AdminPromptManagementPage = () => {
  const { t } = useTranslation();
  const [requireApproval, setRequireApproval] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
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

  const showKanban = requireApproval && !isMobile;

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AdminLayout activeTab="admin-prompts">
      {({ onMenuClick }) => (
        <>
          <PageHeader
            title="Quản lý Prompt"
            description="Duyệt, từ chối và quản lý tất cả prompts trong hệ thống"
            breadcrumb="Quản lý Prompt"
            onMenuClick={onMenuClick}
          />
          <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06] shrink-0">
            <ApprovalToggle value={requireApproval} onChange={setRequireApproval} />
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0d0d0d]">
            <div className="p-6">
              {isMobile && requireApproval && (
                <div className="mb-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-md px-3 py-2">
                  Kanban không khả dụng trên mobile — hiển thị dạng danh sách.
                </div>
              )}
              {showKanban ? <KanbanBoard /> : <PromptManageList />}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminPromptManagementPage;
