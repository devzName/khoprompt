import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FireOutlined, StarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Pagination, Avatar, Tooltip, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import PromptDrawer from './PromptDrawer';
import TagsDisplay from './TagsDisplay';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
const LatestPrompts = ({
  title = null,
  description = null,
  icon = null,
  prompts = [],
  currentPrompt = null,
  filterByCategory = false,
  maxItems = null,
  showPagination = true,
  pageSize = 8,
  columns = 4,
  loading = false,
  pagination = null
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
  const totalItems = pagination ? pagination.total : filteredPrompts.length;
  let paginatedPrompts = filteredPrompts;
  if (!pagination && showPagination && !maxItems) {
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
      <section className="py-4 latest-prompts-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    if (!pagination) {
      setCurrentPage(page);
      document.querySelector('.latest-prompts-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
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
    navigate(ROUTES.PROMPT_DETAIL_PATH(prompt.slug));
  };
  return (
    <>
      <section className="py-4 latest-prompts-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {icon || <FireOutlined className="text-2xl text-orange-500" />}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {title || t('latest.title')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {description || t('latest.subtitle')}
                </p>
              </div>
            </div>
          </div>
          <div className={getGridClasses()}>
            {paginatedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 flex flex-col group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge 
                    count={typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                    style={{ 
                      backgroundColor: '#f0f0f0', 
                      color: '#666',
                      fontSize: '11px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      height: 'auto',
                      lineHeight: '1.4'
                    }}
                  />
                  {prompt.featured && (
                    <StarOutlined className="text-yellow-500 text-sm" />
                  )}
                </div>
                <h3 
                  className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer group-hover:text-[#3568a6] transition-colors duration-200 h-14 leading-7"
                  onClick={() => handleCardClick(prompt)}
                >
                  {prompt.title}
                </h3>
                <p 
                  className={`text-gray-600 text-sm mb-3 overflow-hidden ${prompt.tags && prompt.tags.length > 0 ? 'line-clamp-2' : 'line-clamp-3'}`} 
                  style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: prompt.tags && prompt.tags.length > 0 ? 2 : 4, 
                    WebkitBoxOrient: 'vertical' 
                  }}
                >
                  {prompt.description}
                </p>
                {prompt.tags && prompt.tags.length > 0 && (
                  <TagsDisplay tags={prompt.tags} className="mb-3" />
                )}
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar 
                      size={24} 
                      src={prompt.user?.avatar_url || prompt.user?.picture}
                      icon={<UserOutlined />} 
                      className="shrink-0"
                    />
                    <div className="flex flex-col gap-1 text-gray-500">
                      <span className="text-xs font-medium text-gray-700">
                        {prompt.user?.full_name || prompt.author || 'Unknown'}
                      </span>
                      {prompt.user?.email && (
                        <span className="text-[10px] text-gray-400">{prompt.user.email}</span>
                      )}
                    </div>
                  </div>
                  <Tooltip title={t('latest.quickView', 'Xem nhanh')}>
                    <button
                      onClick={(e) => handleQuickView(e, prompt)}
                      className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
                    >
                      <EyeOutlined className="text-sm" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
          {(showPagination || pagination) && !maxItems && totalItems > (pagination?.pageSize || pageSize) && (
            <div className="flex justify-center">
              <Pagination
                current={pagination?.current || currentPage}
                total={totalItems}
                pageSize={pagination?.pageSize || pageSize}
                onChange={pagination?.onChange || handlePageChange}
                showSizeChanger={pagination?.showSizeChanger ?? false}
                showQuickJumper={pagination?.showQuickJumper ?? false}
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
        currentUser={user}
      />
    </>
  );
};
export default LatestPrompts;