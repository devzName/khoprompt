import {
  TeamOutlined,
  SafetyOutlined,
  CodeOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  ProjectOutlined,
  BgColorsOutlined,
  BulbOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  FolderOutlined,
  DownOutlined,
  UpOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Segmented } from 'antd';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../axios/apiClient';
import CategoryTree from './CategoryTree';

const Categories = ({ selectedCategory, onCategorySelect }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const INITIAL_DISPLAY_COUNT = 4;

  const getIcon = (name) => {
    switch (name) {
      case 'HR': return <TeamOutlined />;
      case 'Administration': return <SafetyOutlined />;
      case 'Testing': return <ExperimentOutlined />;
      case 'Development': return <CodeOutlined />;
      case 'Business Analysis': return <FileSearchOutlined />;
      case 'Project Management': return <ProjectOutlined />;
      case 'Design': return <BgColorsOutlined />;
      case 'Marketing': return <BulbOutlined />;
      case 'Data Analysis': return <BarChartOutlined />;
      default: return <AppstoreOutlined />;
    }
  };

  const handleCategoryClick = (category) => {
    if (category.slug === 'all') {
      onCategorySelect(null); // null means "all categories"
    } else {
      onCategorySelect(category);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.STATS);
        const { categories, total_prompts } = response.data;

        const formattedCategories = [
          {
            id: null,
            title: t('categories.all'),
            slug: 'all',
            icon: <AppstoreOutlined />,
            count: total_prompts
          },
          ...categories.map(cat => ({
            id: cat.id,
            title: cat.name,
            slug: cat.slug,
            icon: getIcon(cat.name),
            count: cat.prompt_count
          }))
        ];
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching category stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTreeData = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.TREE);
        setTreeData(response.data);
      } catch (error) {
        console.error('Error fetching categories tree:', error);
      } finally {
        setTreeLoading(false);
      }
    };

    fetchStats();
    fetchTreeData();
  }, [t]);

  if (loading) return null;

  // Tree view
  if (viewMode === 'tree') {
    return (
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOutlined className="text-2xl text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                {t('categories.title', 'Danh mục Prompts')}
              </h2>
            </div>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                {
                  label: (
                    <div className="flex items-center gap-2 px-2">
                      <AppstoreAddOutlined />
                      <span>{t('categories.viewGrid', 'Grid')}</span>
                    </div>
                  ),
                  value: 'grid'
                },
                {
                  label: (
                    <div className="flex items-center gap-2 px-2">
                      <UnorderedListOutlined />
                      <span>{t('categories.viewTree', 'Tree')}</span>
                    </div>
                  ),
                  value: 'tree'
                }
              ]}
            />
          </div>

          <CategoryTree 
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            treeData={treeData}
            loading={treeLoading}
          />
        </div>
      </section>
    );
  }

  // Grid view (existing code)
  const displayedCategories = isExpanded ? categories : categories.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreCategories = categories.length > INITIAL_DISPLAY_COUNT;

  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOutlined className="text-2xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {t('categories.title', 'Danh mục Prompts')}
            </h2>
          </div>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                label: (
                  <div className="flex items-center gap-2 px-2">
                    <AppstoreAddOutlined />
                    <span>{t('categories.viewGrid', 'Grid')}</span>
                  </div>
                ),
                value: 'grid'
              },
              {
                label: (
                  <div className="flex items-center gap-2 px-2">
                    <UnorderedListOutlined />
                    <span>{t('categories.viewTree', 'Tree')}</span>
                  </div>
                ),
                value: 'tree'
              }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedCategories.map((category, index) => {
            const isSelected = selectedCategory?.id === category.id || (!selectedCategory && category.slug === 'all');
            
            return (
              <div
                key={index}
                onClick={() => handleCategoryClick(category)}
                className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                  isSelected 
                    ? 'border-blue-500 shadow-lg bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-3xl group-hover:scale-110 transition-transform duration-300 ${
                    isSelected ? 'text-blue-600' : 'text-blue-600'
                  }`}>
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-lg font-semibold truncate ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {category.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${
                        isSelected 
                          ? 'bg-blue-200 text-blue-800' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMoreCategories && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <>
                  <UpOutlined className="text-xs" />
                  {t('categories.showLess', 'Ẩn bớt')}
                </>
              ) : (
                <>
                  <DownOutlined className="text-xs" />
                  {t('categories.showMore', 'Xem thêm')} ({categories.length - INITIAL_DISPLAY_COUNT})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
