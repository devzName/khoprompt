/**
 * Prompt list page — browse, search, and filter all public prompts.
 * Route: /prompts
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Spin, Empty, Drawer, notification, Pagination, Tooltip } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
import PageHeader from '../components/shared/PageHeader';
import FilterSidebar from '../components/FilterSidebar';
import PromptCard from '../components/PromptCard';
import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const { Search } = Input;

const PromptListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE);
      setCategories(response.data || response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 12,
        search: search || undefined,
        category_id: category || undefined,
      };

      if (sortBy === 'featured') params.is_featured = true;
      if (sortBy === 'popular') {
        params.sort_by = 'view_count';
        params.sort_order = 'desc';
      }

      const data = await promptService.getPrompts(params);
      const promptArray = data.data || data.items || (Array.isArray(data) ? data : []);
      setPrompts(promptArray);
      setTotal(data.pagination?.total || data.total || (data.data || data).length);
    } catch {
      notification.error({ message: t('common.error'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sortBy, t]);

  useEffect(() => { 
    fetchCategories();
  }, []);

  useEffect(() => { 
    fetchPrompts(); 
  }, [fetchPrompts]);

  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleCategory = (value) => { setCategory(value); setPage(1); };
  const handleSort = (value) => { setSortBy(value); setPage(1); };
  const handleReset = () => { setCategory(null); setSortBy('latest'); setSearch(''); setPage(1); };

  return (
    <div className="flex h-full bg-white dark:bg-[#0a0a0a]">
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block">
        <FilterSidebar
          type="prompts"
          categories={categories}
          selectedCategory={category}
          onCategoryChange={handleCategory}
          sortBy={sortBy}
          onSortChange={handleSort}
          onReset={handleReset}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filters"
        placement="left"
        onClose={() => setMobileFilterOpen(false)}
        open={mobileFilterOpen}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <FilterSidebar
          type="prompts"
          categories={categories}
          selectedCategory={category}
          onCategoryChange={(val) => { handleCategory(val); setMobileFilterOpen(false); }}
          sortBy={sortBy}
          onSortChange={(val) => { handleSort(val); setMobileFilterOpen(false); }}
          onReset={() => { handleReset(); setMobileFilterOpen(false); }}
          isMobile
        />
      </Drawer>

      <div className="flex-1 overflow-y-auto">
        <PageHeader
          title={t('prompts.explore', 'Explore Prompts')}
          description={t('prompts.discoverSubtitle', 'Discover the best community prompts to supercharge your workflow.')}
          breadcrumb={t('prompts.explore', 'Explore Prompts')}
          onMenuClick={() => setMobileFilterOpen(true)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + View Toggle */}
          <div className="flex items-center gap-3 mb-8">
            <Search
              placeholder={t('header.search', 'Search prompts...')}
              onSearch={handleSearch}
              onChange={e => !e.target.value && handleSearch('')}
              allowClear
              size="large"
              className="prompt-search-input flex-1"
            />
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg shrink-0">
              <Tooltip title="Grid view">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  <AppstoreOutlined />
                </button>
              </Tooltip>
              <Tooltip title="List view">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  <UnorderedListOutlined />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Main Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Spin size="large" />
              <span className="text-gray-400 text-lg font-medium animate-pulse">Loading prompts...</span>
            </div>
          ) : prompts.length === 0 ? (
            <div className="py-24 bg-gray-50/50 dark:bg-white/2 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col gap-3">
                    <span className="text-xl font-semibold text-gray-400">No prompts found</span>
                    <p className="text-gray-400/60 max-w-xs mx-auto">Try adjusting your search filters.</p>
                    <Button type="link" onClick={handleReset} className="text-indigo-500 font-bold">Reset Filters</Button>
                  </div>
                }
              />
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {prompts.map(prompt => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#E2E8F0] dark:divide-white/5 border border-[#E2E8F0] dark:border-white/5 rounded-xl overflow-hidden">
                  {prompts.map((prompt, i) => (
                    <PromptCard key={prompt.id} prompt={prompt} listMode index={i} />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {total > 12 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    current={page}
                    pageSize={12}
                    total={total}
                    onChange={setPage}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .prompt-search-input :global(.ant-input-affix-wrapper) {
          border-radius: 16px;
          padding: 10px 20px;
          border-color: rgba(0,0,0,0.06);
          background: rgba(0,0,0,0.02);
          transition: all 0.3s;
        }
        .prompt-search-input :global(.ant-input-affix-wrapper-focused) {
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        :global(.dark) .prompt-search-input :global(.ant-input-affix-wrapper) {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }
        :global(.dark) .prompt-search-input :global(.ant-input-affix-wrapper-focused) {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
};

export default PromptListPage;
