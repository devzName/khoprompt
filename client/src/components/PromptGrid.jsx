import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarOutlined, EyeOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';
import PromptDrawer from './PromptDrawer';
import { calculateSimpleRating, formatRating, getRatingContainerColor } from '../utils/ratingUtils';
const PromptGrid = ({ 
  prompts = [], 
  title, 
  icon, 
  showPagination = false, 
  pageSize = 8,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
}) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const handleQuickView = (e, prompt) => {
    e.stopPropagation(); // Prevent card click
    setSelectedPrompt(prompt);
    setDrawerOpen(true);
  };
  const handleCardClick = (prompt) => {
    navigate(`/prompt/${prompt.id}`);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPrompts = showPagination ? prompts.slice(startIndex, endIndex) : prompts;
  return (
    <>
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {icon}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {title} {showPagination ? '' : `(${prompts.length})`}
                </h2>
              </div>
            </div>
          )}
          <div className={`grid ${gridCols} gap-6`}>
            {currentPrompts.map((prompt) => (
              <div 
                key={prompt.id} 
                className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 flex flex-col cursor-pointer"
                onClick={() => handleCardClick(prompt)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md">
                    {typeof prompt.category === 'object' ? prompt.category?.name : prompt.category}
                  </span>
                  {prompt.featured && (
                    <StarOutlined className="text-yellow-500 text-sm" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{prompt.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 grow">{prompt.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {prompt.tags?.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                      #{typeof tag === 'object' ? tag.name : tag}
                    </span>
                  ))}
                  {prompt.tags?.length > 2 && (
                    <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded">
                      +{prompt.tags.length - 2}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs mt-auto">
                  {formatRating(calculateSimpleRating(prompt)) && (
                    <div className={`flex items-center gap-1 ${getRatingContainerColor(calculateSimpleRating(prompt))}`}>
                      <StarOutlined />
                      <span>
                        {formatRating(calculateSimpleRating(prompt))}
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={(e) => handleQuickView(e, prompt)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs font-medium"
                  >
                    <EyeOutlined className="text-xs" />
                    Xem nhanh
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showPagination && prompts.length > pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                total={prompts.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} của ${total} prompts`
                }
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
export default PromptGrid;