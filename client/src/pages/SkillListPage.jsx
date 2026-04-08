/**
 * Skill list page — browse, search, and filter skills.
 * Route: /skills
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Spin, Empty, Drawer, notification, Pagination, Tag, Tooltip } from 'antd';
import { 
  EyeOutlined,
  LikeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { skillService } from '../services/skillService';
import { ROUTES } from '../constants/routes';
import PageHeader from '../components/shared/PageHeader';
import FilterSidebar from '../components/FilterSidebar';

const { Search } = Input;

const CATEGORIES = [
  'Development', 'Testing', 'DevOps', 'Documentation', 'Security',
  'Architecture', 'Review', 'Debugging', 'Refactoring', 'Other',
];

const SkillCard = ({ skill, onClick, listMode = false }) => {
  if (listMode) {
    return (
      <div
        onClick={() => onClick(skill.id)}
        className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-[#141414] hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white truncate">{skill.name}</span>
            {skill.category && (
              <Tag className="m-0 border-none bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 shrink-0">
                {skill.category}
              </Tag>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 truncate">{skill.description || 'No description provided.'}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-neutral-500 shrink-0">
          <span className="flex items-center gap-1"><EyeOutlined /> {skill.view_count ?? 0}</span>
          <span className="flex items-center gap-1"><LikeOutlined /> {skill.like_count ?? 0}</span>
          <span className="hidden sm:block">@{skill.user?.full_name?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(skill.id)}
      className="group relative bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
    >
    {/* Decorative background gradient */}
    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
    
    <div className="relative flex flex-col h-full gap-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {skill.name}
        </h3>
        {skill.category && (
          <Tag className="m-0 border-none bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5">
            {skill.category}
          </Tag>
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2 h-10 leading-relaxed">
        {skill.description || 'No description provided.'}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {skill.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="text-[11px] bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-neutral-500 px-2 py-0.5 rounded-md">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><EyeOutlined className="text-blue-500/70" /> {skill.view_count ?? 0}</span>
          <span className="flex items-center gap-1"><LikeOutlined className="text-pink-500/70" /> {skill.like_count ?? 0}</span>
        </div>
        <span className="font-medium text-gray-400/80">@{skill.user?.full_name?.split(' ')[0] || 'User'}</span>
      </div>
    </div>
  </div>
  );
};

const SkillListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      
      if (sortBy === 'popular') {
        params.sort_by = 'view_count';
        params.sort_order = 'desc';
      } else if (sortBy === 'liked') {
        params.sort_by = 'like_count';
        params.sort_order = 'desc';
      }
      
      const data = await skillService.getSkills(params);
      const skillArray = data.data || data.items || (Array.isArray(data) ? data : []);
      setSkills(skillArray);
      setTotal(data.total ?? (data.items ?? data).length);
    } catch {
      notification.error({ message: t('common.error'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sortBy, t]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleCategory = (value) => { setCategory(value); setPage(1); };
  const handleSort = (value) => { setSortBy(value); setPage(1); };
  const handleReset = () => { setCategory(null); setSortBy('latest'); setSearch(''); setPage(1); };
  const handleCardClick = (id) => navigate(ROUTES.SKILL_DETAIL_PATH(id));

  return (
    <div className="flex h-full bg-white dark:bg-[#0a0a0a]">
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block">
        <FilterSidebar
          type="skills"
          categories={CATEGORIES}
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
          type="skills"
          categories={CATEGORIES}
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
          title={t('skills.title', 'Skills')}
          description={t('skills.exploreSubtitle', 'Enhance your agents with pre-built capabilities.')}
          breadcrumb={t('skills.title', 'Skills')}
          onMenuClick={() => setMobileFilterOpen(true)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + View Toggle */}
          <div className="flex items-center gap-3 mb-8">
            <Search
              placeholder={t('skills.searchPlaceholder', 'Search skills...')}
              onSearch={handleSearch}
              onChange={e => !e.target.value && handleSearch('')}
              allowClear
              size="large"
              className="skill-search-input flex-1"
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
              <Spin size="large" className="custom-spin" />
              <span className="text-gray-400 text-lg font-medium animate-pulse">Scanning skills directory...</span>
            </div>
          ) : skills.length === 0 ? (
            <div className="py-24 bg-gray-50/50 dark:bg-white/2 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col gap-3">
                    <span className="text-xl font-semibold text-gray-400">No skills found</span>
                    <p className="text-gray-400/60 max-w-xs mx-auto">Try adjusting your search filters or create the first skill for this category!</p>
                    <Button type="link" onClick={handleReset} className="text-indigo-500 font-bold">Reset Filters</Button>
                  </div>
                } 
              />
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.isArray(skills) && skills.map(skill => (
                    <SkillCard key={skill?.id} skill={skill} onClick={handleCardClick} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                  {Array.isArray(skills) && skills.map(skill => (
                    <SkillCard key={skill?.id} skill={skill} onClick={handleCardClick} listMode />
                  ))}
                </div>
              )}

              {total > 12 && (
                <div className="mt-16 flex justify-center">
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
        .skill-search-input :global(.ant-input-affix-wrapper) {
          border-radius: 16px;
          padding: 10px 20px;
          border-color: rgba(0,0,0,0.06);
          background: rgba(0,0,0,0.02);
          transition: all 0.3s;
        }
        .skill-search-input :global(.ant-input-affix-wrapper-focused) {
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        :global(.dark) .skill-search-input :global(.ant-input-affix-wrapper) {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }
        :global(.dark) .skill-search-input :global(.ant-input-affix-wrapper-focused) {
          background: rgba(255,255,255,0.05);
        }
        :global(.ant-select-selector) {
          border-radius: 16px !important;
          border-color: rgba(0,0,0,0.06) !important;
        }
        :global(.dark) :global(.ant-select-selector) {
          background: rgba(255,255,255,0.03) !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default SkillListPage;
