import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PromptDrawer from './PromptDrawer';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';

const FeaturedPrompts = ({ prompts = [], loading = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const featuredPrompts = prompts;

  if (loading) {
    return (
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-64 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
    navigate(ROUTES.PROMPT_DETAIL_PATH(prompt.id));
  };

  return (
    <>
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <StarOutlined className="text-2xl text-yellow-500" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t('featured.title')} ({featuredPrompts.length})
              </h2>
              <p className="text-gray-600 mt-1">
                {t('featured.subtitle', { count: featuredPrompts.length })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
                onClick={() => handleCardClick(prompt)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <StarOutlined className="text-sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {prompt.rating || ((prompt.like_count || 0) > 0 ? (prompt.like_count / Math.max(1, (prompt.like_count || 0) + (prompt.dislike_count || 0)) * 5).toFixed(1) : '5.0')}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{prompt.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 grow">{prompt.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      #{typeof tag === 'object' ? tag.name : tag}
                    </span>
                  ))}
                  {prompt.tags?.length > 3 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      +{prompt.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm mt-auto">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{t('featured.by')} {prompt.author || prompt.user?.full_name || 'Unknown'}</span>
                  </div>
                  <button
                    onClick={(e) => handleQuickView(e, prompt)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                  >
                    <EyeOutlined className="text-xs" />
                    {t('featured.quickView')}
                  </button>
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
      />
    </>
  );
};

export default FeaturedPrompts;