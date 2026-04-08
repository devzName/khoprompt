import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { promptService } from '../../services/promptService';
import { PAGINATION } from '../../constants/pagination';
import PageHeader from '../shared/PageHeader';
import PromptsTable from '../shared/PromptsTable';
import PersonalStatsBar from '../shared/personal-stats-bar';

const { Search } = Input;

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Mới nhất' },
  { value: 'created_at:asc', label: 'Cũ nhất' },
  { value: 'view_count:desc', label: 'Lượt xem nhiều nhất' },
  { value: 'title:asc', label: 'Tiêu đề A-Z' },
];

/**
 * MyPromptsList
 * List tab for MyPromptsPage — handles URL sync, stats bar, filtering, table.
 *
 * Props:
 *   onCreatePrompt  — () => void
 *   onEditPrompt    — (prompt) => void
 *   onMenuClick     — () => void
 *   currentUser     — user object
 */
const MyPromptsList = ({ onCreatePrompt, onEditPrompt, onMenuClick, currentUser }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL
  const activeStatus = searchParams.get('status') || 'all';
  const sortRaw = searchParams.get('sort') || 'created_at:desc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchValue = searchParams.get('q') || '';

  const [prompts, setPrompts] = useState([]);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, draft: 0, rejected: 0 });

  // Parse sort string "field:order" → { sortBy, sortOrder }
  const parsedSort = (() => {
    const [sortBy, sortOrder] = sortRaw.split(':');
    return { sortBy: sortBy || 'created_at', sortOrder: sortOrder || 'desc' };
  })();

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      // Remove param for falsy/default values so URL stays clean
      const isDefault = v === null || v === undefined || v === '' || v === 'all' || (k === 'page' && (v === 1 || v === '1'));
      if (isDefault) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const fetchPrompts = useCallback(async (page, q, status, sortBy, sortOrder) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGINATION.PAGE_SIZE,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (q) params.search = q;
      if (status && status !== 'all') params.status = status;

      const response = await promptService.getMyPrompts(params);
      setPrompts(response.data || response);
      setTotalPrompts(response.pagination?.total || response.length || 0);
    } catch {
      notification.error({ message: t('common.error'), description: t('myPrompts.errorFetching', 'Lỗi tải danh sách'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await promptService.getMyStats();
      setStats(data);
    } catch {
      // non-critical — silently ignore
    }
  }, []);

  // Reload when URL params change
  useEffect(() => {
    fetchPrompts(currentPage, searchValue, activeStatus, parsedSort.sortBy, parsedSort.sortOrder);
  }, [currentPage, searchValue, activeStatus, sortRaw]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load stats once on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStatusClick = (key) => {
    updateParams({ status: key, page: null });
  };

  const handleSortChange = (value) => {
    updateParams({ sort: value, page: null });
  };

  const handleSearchSubmit = (value) => {
    updateParams({ q: value || null, page: null });
  };

  const handleTableChange = (tableFilters) => {
    const newSortBy = tableFilters.sortBy || parsedSort.sortBy;
    const newSortOrder = tableFilters.sortOrder || parsedSort.sortOrder;
    updateParams({
      page: tableFilters.page || 1,
      status: tableFilters.status || activeStatus,
      sort: `${newSortBy}:${newSortOrder}`,
    });
  };

  const handleDeletePrompt = async (id) => {
    // id=null is a bulk-delete completion signal from PromptsTable — just refresh
    if (id === null) {
      fetchPrompts(currentPage, searchValue, activeStatus, parsedSort.sortBy, parsedSort.sortOrder);
      fetchStats();
      return;
    }
    try {
      await promptService.deletePrompt(id);
      notification.success({ message: t('common.success'), description: t('myPrompts.deleteSuccess', 'Đã xóa prompt'), placement: 'topRight' });
      fetchPrompts(currentPage, searchValue, activeStatus, parsedSort.sortBy, parsedSort.sortOrder);
      fetchStats();
    } catch {
      notification.error({ message: t('common.error'), description: t('myPrompts.deleteError', 'Lỗi khi xóa'), placement: 'topRight' });
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      await promptService.submitPrompt(id);
      notification.success({ message: t('common.success'), description: t('myPrompts.submitSuccess'), placement: 'topRight' });
      fetchPrompts(currentPage, searchValue, activeStatus, parsedSort.sortBy, parsedSort.sortOrder);
      fetchStats();
    } catch {
      notification.error({ message: t('common.error'), description: t('myPrompts.submitError'), placement: 'topRight' });
    }
  };

  const handleResubmit = async (id) => {
    try {
      await promptService.resubmitPrompt(id);
      notification.success({ message: t('common.success'), description: 'Đã gửi lại để duyệt', placement: 'topRight' });
      fetchPrompts(currentPage, searchValue, activeStatus, parsedSort.sortBy, parsedSort.sortOrder);
      fetchStats();
    } catch {
      notification.error({ message: t('common.error'), description: 'Lỗi khi gửi lại', placement: 'topRight' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('myPrompts.title')}
        description={t('myPrompts.description')}
        breadcrumb={t('myPrompts.title')}
        onMenuClick={onMenuClick}
      />

      {/* Toolbar — separate from page title */}
      <div className="flex flex-wrap gap-2 items-center px-6 py-3 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/[0.06] shrink-0">
        <Search
          placeholder={t('myPrompts.searchPlaceholder')}
          defaultValue={searchValue}
          key={searchValue}
          onSearch={handleSearchSubmit}
          style={{ maxWidth: 260 }}
          allowClear
          aria-label="Tìm kiếm prompt"
        />
        <Select
          value={sortRaw}
          onChange={handleSortChange}
          options={SORT_OPTIONS}
          style={{ minWidth: 160 }}
          aria-label="Sắp xếp prompt"
        />
        <div className="flex-1" />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreatePrompt}
          className="whitespace-nowrap"
        >
          {t('myPrompts.createPrompt.title')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0d0d0d]">
        <div className="w-full p-4 sm:p-6">
          <PersonalStatsBar stats={stats} activeStatus={activeStatus} onStatusClick={handleStatusClick} />
          <PromptsTable
            prompts={prompts}
            loading={loading}
            onSubmitPrompt={handleSubmitForReview}
            onEditPrompt={onEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            onResubmitPrompt={handleResubmit}
            currentUser={currentUser}
            pagination={{
              current: currentPage,
              total: totalPrompts,
              pageSize: PAGINATION.PAGE_SIZE,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            searchValue={searchValue}
            onCreatePrompt={onCreatePrompt}
            showCreateButton
            onTableChange={handleTableChange}
            mode="personal"
            onRefreshStats={fetchStats}
          />
        </div>
      </div>
    </div>
  );
};

export default MyPromptsList;
