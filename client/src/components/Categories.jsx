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
  FolderOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const Categories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/v1/prompt-categories/stats');
        if (response.ok) {
          const data = await response.json();

          const totalCount = data.reduce((acc, cat) => acc + cat.prompt_count, 0);

          const formattedCategories = [
            {
              title: t('categories.all'),
              slug: 'all',
              icon: <AppstoreOutlined />,
              count: totalCount
            },
            ...data.map(cat => ({
              title: cat.name,
              slug: cat.slug,
              icon: getIcon(cat.name),
              count: cat.prompt_count
            }))
          ];
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error fetching category stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  const handleCategoryClick = (slug) => {
    if (slug === 'all') {
      navigate('/'); // Or a search page if you have one, homepage lists all usually
    } else {
      navigate(ROUTES.CATEGORY_PATH(slug));
    }
  };

  if (loading) return null;

  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <FolderOutlined className="text-2xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {t('categories.title')}
            </h2>
          </div>
          <p className="text-gray-600">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category.slug)}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="text-blue-600 text-3xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{category.title}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shrink-0">
                      {category.count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
