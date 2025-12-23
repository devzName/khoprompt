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
import { useTranslation } from 'react-i18next';

const Categories = () => {
  const { t } = useTranslation();
  
  const categories = [
    {
      title: t('categories.all'),
      icon: <AppstoreOutlined />,
      count: 190
    },
    {
      title: 'HR',
      icon: <TeamOutlined />,
      count: 25
    },
    {
      title: 'Administration',
      icon: <SafetyOutlined />,
      count: 15
    },
    {
      title: 'Testing',
      icon: <ExperimentOutlined />,
      count: 28
    },
    {
      title: 'Development',
      icon: <CodeOutlined />,
      count: 45
    },
    {
      title: 'Business Analysis',
      icon: <FileSearchOutlined />,
      count: 20
    },
    {
      title: 'Project Management',
      icon: <ProjectOutlined />,
      count: 22
    },
    {
      title: 'Design',
      icon: <BgColorsOutlined />,
      count: 32
    },
    {
      title: 'Marketing',
      icon: <BulbOutlined />,
      count: 38
    },
    {
      title: 'Data Analysis',
      icon: <BarChartOutlined />,
      count: 18
    },
    {
      title: 'Other',
      icon: <AppstoreOutlined />,
      count: 12
    }
  ];

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
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer group">
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
