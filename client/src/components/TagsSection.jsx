import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { promptTagsService } from '../services/promptTagsService';
const TagsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 24;
  const handleTagClick = (tagName) => {
    navigate(`/search?q=${encodeURIComponent(tagName)}&type=tag`);
  };
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await promptTagsService.getTags();
        setTags(response);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [t]);
  if (loading) {
    return (
      <section className="py-4 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <TagOutlined className="text-2xl text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                {t('tags.title')}
              </h2>
            </div>
            <p className="text-gray-600">
              {t('tags.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-3">
            {[...Array(24)].map((_, index) => (
              <div
                key={index}
                className="h-5 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
  const displayedTags = showAll ? tags : tags.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreTags = tags.length > INITIAL_DISPLAY_COUNT;
  return (
    <section className="py-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TagOutlined className="text-2xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {t('tags.title')}
            </h2>
          </div>
          <p className="text-gray-600">
            {t('tags.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-3">
          {displayedTags.length > 0 ? (
            displayedTags.map((tag, index) => (
              <button
                key={tag.id || index}
                onClick={() => handleTagClick(typeof tag === 'object' ? tag.name : tag)}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm py-1 cursor-pointer"
              >
                {typeof tag === 'object' ? tag.name : tag}
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-sm">
                {t('tags.noTagsAvailable', 'Không có tags nào khả dụng')}
              </p>
            </div>
          )}
        </div>
        {hasMoreTags && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            >
              {showAll ? (
                <>
                  <UpOutlined className="text-xs" />
                  {t('tags.showLess', 'Ẩn bớt')}
                </>
              ) : (
                <>
                  <DownOutlined className="text-xs" />
                  {t('tags.showMore', 'Xem thêm')} ({tags.length - INITIAL_DISPLAY_COUNT})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
export default TagsSection;
