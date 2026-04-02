import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Tooltip, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/use-dark-mode';
import PromptDrawer from './PromptDrawer';
import TagsDisplay from './TagsDisplay';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
import { formatRating, getRatingContainerColor } from '../utils/ratingUtils';
const FeaturedPrompts = ({ prompts = [], loading = false }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isDark] = useDarkMode();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const featuredPrompts = prompts;
  if (loading) {
    return (
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-64 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (featuredPrompts.length === 0) {
    return null;
  }
  const handleQuickView = async (e, prompt) => {
    e.stopPropagation();
    try {
      const detailedPrompt = await promptService.getPromptById(prompt.id);
      setSelectedPrompt(detailedPrompt);
      setDrawerOpen(true);
      setTimeout(() => {
        const drawerBody = document.querySelector('.ant-drawer-body');
        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to fetch prompt details:', error);
      setSelectedPrompt(prompt);
      setDrawerOpen(true);
      setTimeout(() => {
        const drawerBody = document.querySelector('.ant-drawer-body');
        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      }, 100);
    }
  };
  const handleCardClick = (prompt) => {
    navigate(ROUTES.PROMPT_DETAIL_PATH(prompt.slug));
  };
  return (
    <>
      <section className="py-4 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <StarOutlined className="text-2xl text-yellow-500" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('featured.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {t('featured.subtitle', { count: featuredPrompts.length })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 flex flex-col group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge 
                    count={typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                    style={{ 
                      backgroundColor: isDark ? '#002c8c' : '#e6f4ff', 
                      color: isDark ? '#69b1ff' : '#1677ff',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      height: 'auto',
                      lineHeight: '1.4'
                    }}
                  />
                  {prompt.simple_rating && (
                    <div className={`flex items-center gap-1 ${getRatingContainerColor(prompt.simple_rating)}`}>
                      <StarOutlined className="text-sm" />
                      <span className="text-sm font-medium">
                        {formatRating(prompt.simple_rating)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer group-hover:text-[#3568a6] dark:group-hover:text-blue-400 transition-colors duration-200"
                  onClick={() => handleCardClick(prompt)}
                >
                  {prompt.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 grow">{prompt.description}</p>
                <TagsDisplay tags={prompt.tags} className="mb-4" />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between text-sm mt-auto">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      size={32} 
                      src={prompt.user?.avatar_url || prompt.user?.picture}
                      icon={<UserOutlined />} 
                      className="shrink-0"
                    />
                    <div className="flex flex-col gap-1 text-gray-500">
                      <span>{t('featured.by')} {prompt.author || prompt.user?.full_name || 'Unknown'}</span>
                      {prompt.user?.email && (
                        <span className="text-xs text-gray-400">{prompt.user.email}</span>
                      )}
                    </div>
                  </div>
                  <Tooltip title={t('featured.quickView', 'Xem nhanh')}>
                    <button
                      onClick={(e) => handleQuickView(e, prompt)}
                      className="flex items-center justify-center w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 cursor-pointer"
                    >
                      <EyeOutlined className="text-base" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PromptDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prompt={selectedPrompt}
        currentUser={user}
      />
    </>
  );
};
export default FeaturedPrompts;