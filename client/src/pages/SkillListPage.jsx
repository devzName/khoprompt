/**
 * Skill list page — browse, search, and filter skills.
 * Route: /skills
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, Tag, Pagination, Spin, Empty, Drawer, notification } from 'antd';
import { PlusOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import { skillService } from '../services/skillService';
import { ROUTES } from '../constants/routes';
import Sidebar from '../components/Sidebar';

const { Search } = Input;

const CATEGORIES = [
  'Development', 'Testing', 'DevOps', 'Documentation', 'Security',
  'Architecture', 'Review', 'Debugging', 'Refactoring', 'Other',
];

const SkillCard = ({ skill, onClick }) => (
  <Card
    hoverable
    onClick={() => onClick(skill.id)}
    className="cursor-pointer h-full"
    size="small"
  >
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm line-clamp-1">{skill.name}</span>
        {skill.category && <Tag className="shrink-0">{skill.category}</Tag>}
      </div>
      <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-2 flex-1">
        {skill.description || '—'}
      </p>
      <div className="flex flex-wrap gap-1">
        {skill.tags?.slice(0, 4).map(tag => (
          <Tag key={tag} className="text-xs">{tag}</Tag>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-neutral-500 pt-1">
        <span className="flex items-center gap-1"><EyeOutlined />{skill.view_count ?? 0}</span>
        <span className="flex items-center gap-1"><LikeOutlined />{skill.like_count ?? 0}</span>
        <span className="ml-auto">{skill.user?.full_name || ''}</span>
      </div>
    </div>
  </Card>
);

const SkillListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);

  const menuItems = useSidebarMenu('skills', user, navigate, null, t);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await skillService.getSkills(params);
      setSkills(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
    } catch {
      notification.error({ message: t('common.error'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [page, search, category, t]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleCategory = (value) => { setCategory(value); setPage(1); };
  const handleCardClick = (id) => navigate(ROUTES.SKILL_DETAIL_PATH(id));

  return (
    <div className="flex h-full bg-white dark:bg-[#111]">
      <div className="hidden lg:block">
        <Sidebar menuItems={menuItems} activeTab="skills" />
      </div>

      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={208}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar menuItems={menuItems} activeTab="skills" />
      </Drawer>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">{t('skills.title', 'Skills')}</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.SKILL_CREATE)}
            >
              {t('skills.create', 'Create Skill')}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Search
              placeholder={t('skills.searchPlaceholder', 'Search skills...')}
              onSearch={handleSearch}
              onChange={e => !e.target.value && handleSearch('')}
              allowClear
              style={{ width: 240 }}
            />
            <Select
              placeholder={t('skills.filterCategory', 'Category')}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              onChange={handleCategory}
              allowClear
              style={{ width: 180 }}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-16"><Spin size="large" /></div>
          ) : skills.length === 0 ? (
            <Empty description={t('skills.empty', 'No skills found')} className="py-16" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} onClick={handleCardClick} />
              ))}
            </div>
          )}

          {total > 12 && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={page}
                pageSize={12}
                total={total}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillListPage;
