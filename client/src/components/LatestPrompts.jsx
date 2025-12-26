import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FireOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import PromptDrawer from './PromptDrawer';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';

const LatestPrompts = ({
  title = null,
  prompts = [],
  currentPrompt = null,
  filterByCategory = false,
  maxItems = null,
  showPagination = true,
  pageSize = 8,
  columns = 4,
  loading = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  let filteredPrompts = prompts || [];

  if (currentPrompt && filterByCategory) {
    const currentCategory = typeof currentPrompt.category === 'object' ? currentPrompt.category?.name : currentPrompt.category;
    filteredPrompts = filteredPrompts.filter(prompt => {
      const promptCategory = typeof prompt.category === 'object' ? prompt.category?.name : prompt.category;
      return promptCategory === currentCategory && prompt.id !== currentPrompt.id;
    });
  } else if (currentPrompt) {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.id !== currentPrompt.id);
  }

  const totalItems = filteredPrompts.length;
  let paginatedPrompts = filteredPrompts;

  if (showPagination && !maxItems) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    paginatedPrompts = filteredPrompts.slice(startIndex, endIndex);
  } else if (maxItems) {
    paginatedPrompts = filteredPrompts.slice(0, maxItems);
  }

  const getGridClasses = () => {
    if (columns === 3) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8";
    } else {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8";
    }
  };

  if (loading) {
    return (
      <section className="py-4 bg-white latest-prompts-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Simple Loading Placeholder */}
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (filteredPrompts.length === 0) {
    return null;
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.latest-prompts-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

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
      <section className="py-4 bg-white latest-prompts-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FireOutlined className="text-2xl text-orange-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {title || t('latest.title')} ({totalItems})
                </h2>
                <p className="text-gray-600 mt-1">{t('latest.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className={getGridClasses()}>
            {paginatedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 flex flex-col cursor-pointer"
                onClick={() => handleCardClick(prompt)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                    {typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                  </span>
                  {prompt.featured && (
                    <StarOutlined className="text-yellow-500 text-sm" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{prompt.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 grow">{prompt.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {prompt.tags?.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      #{typeof tag === 'object' ? tag.name : tag}
                    </span>
                  ))}
                  {prompt.tags?.length > 2 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      +{prompt.tags.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs mt-auto">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex items-center gap-1">
                      <StarOutlined className="text-yellow-500" />
                      <span>{prompt.rating || ((prompt.like_count || 0) > 0 ? (prompt.like_count / Math.max(1, (prompt.like_count || 0) + (prompt.dislike_count || 0)) * 5).toFixed(1) : '5.0')}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleQuickView(e, prompt)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                  >
                    <EyeOutlined className="text-xs" />
                    {t('latest.quickView')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showPagination && !maxItems && totalItems > pageSize && (
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} ${t('latest.pagination')} ${total} prompts`
                }
                className="text-sm"
              />
            </div>
          )}
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

export default LatestPrompts;