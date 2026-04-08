import { useState, useEffect } from 'react';
import { Modal, Input, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { promptService } from '../../services/promptService';
import { ROUTES } from '../../constants/routes';
import { PAGINATION } from '../../constants/pagination';
import AdminLayout from '../../components/layouts/AdminLayout';
import DashboardOverview from '../../components/DashboardOverview';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [allPrompts, setAllPrompts] = useState([]);
  const [totalAllPrompts, setTotalAllPrompts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ category: null, status: null });
  const [sorter, setSorter] = useState({ sortBy: 'created_at', sortOrder: 'desc' });
  const [search, setSearch] = useState('');

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrompts = async (page, searchVal = search, filterParams = filters, sortParams = sorter) => {
    setLoading(true);
    try {
      const params = { page, limit: PAGINATION.PAGE_SIZE };
      if (searchVal?.trim()) params.search = searchVal.trim();
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.status) params.status = filterParams.status;
      if (sortParams.sortBy) { params.sort_by = sortParams.sortBy; params.sort_order = sortParams.sortOrder; }
      const response = await promptService.getAllPrompts(params);
      setAllPrompts(response.data || response);
      setTotalAllPrompts(response.pagination?.total || response.length);
    } catch {
      notification.error({ message: t('common.error'), description: t('dashboard.errorFetching'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrompts(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await promptService.approvePrompt(id);
      notification.success({ message: t('common.success'), description: t('reviewPrompts.approveSuccess'), placement: 'topRight' });
      fetchPrompts(currentPage);
    } catch {
      notification.error({ message: t('common.error'), description: t('reviewPrompts.approveError'), placement: 'topRight' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (id) => {
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
      setActionLoading(true);
      await promptService.rejectPrompt(rejectTargetId, rejectReason.trim());
      notification.success({ message: t('common.success'), description: t('reviewPrompts.rejectSuccess'), placement: 'topRight' });
      setRejectModalVisible(false);
      fetchPrompts(currentPage);
    } catch {
      notification.error({ message: t('common.error'), description: t('reviewPrompts.rejectError'), placement: 'topRight' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTableChange = (tableFilters) => {
    const newPage = tableFilters.page || 1;
    const newFilters = { category: tableFilters.category, status: tableFilters.status };
    const newSorter = { sortBy: tableFilters.sortBy || 'created_at', sortOrder: tableFilters.sortOrder || 'desc' };
    setCurrentPage(newPage);
    setFilters(newFilters);
    setSorter(newSorter);
    fetchPrompts(newPage, search, newFilters, newSorter);
  };

  return (
    <AdminLayout activeTab="dashboard">
      {({ onMenuClick }) => (
        <DashboardOverview
          prompts={allPrompts}
          loading={loading}
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onSearchSubmit={(v) => { setSearch(v); setCurrentPage(1); fetchPrompts(1, v); }}
          onEditPrompt={(prompt) => navigate(ROUTES.MY_PROMPTS_EDIT(prompt.id))}
          onDeletePrompt={(id) => { promptService.deletePrompt(id).then(() => fetchPrompts(currentPage)); }}
          onSubmitPrompt={async (id) => { await promptService.submitPrompt(id); fetchPrompts(currentPage); }}
          onApprovePrompt={handleApprove}
          onRejectPrompt={handleReject}
          currentUser={user}
          onMenuClick={onMenuClick}
          onTableChange={handleTableChange}
          pagination={{ current: currentPage, total: totalAllPrompts, pageSize: PAGINATION.PAGE_SIZE }}
        />
      )}

      <Modal
        title="Lý do từ chối"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: actionLoading }}
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
    </AdminLayout>
  );
};

export default AdminDashboardPage;
