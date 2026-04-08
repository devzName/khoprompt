import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from 'antd';
import { SearchOutlined, FireOutlined, FolderOutlined, TagOutlined } from '@ant-design/icons';
import { ROUTES } from '../constants/routes';
import { statisticsService } from '../services/statisticsService';

const AnimatedShape = ({ className }) => (
  <div className={`absolute rounded-full opacity-10 blur-xl ${className}`} />
);

const StatItem = ({ icon, value, label }) => (
  <div className="flex flex-col items-center gap-1 sm:gap-2">
    <div className="text-white/80 text-lg sm:text-xl">{icon}</div>
    <div className="text-white font-bold text-xl sm:text-2xl md:text-3xl">{value}</div>
    <div className="text-white/70 text-xs sm:text-sm">{label}</div>
  </div>
);

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({ approved_prompts: 0, categories: 0, total_views: 0 });

  useEffect(() => {
    statisticsService.getStatistics()
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchValue.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 mb-8 sm:mb-12">
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden rounded-3xl shadow-2xl">
        {/* Animated background shapes */}
        <AnimatedShape className="w-64 h-64 bg-blue-400 dark:bg-blue-600 -top-20 -left-20 animate-pulse" />
        <AnimatedShape className="w-48 h-48 bg-indigo-400 dark:bg-indigo-600 top-10 right-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <AnimatedShape className="w-32 h-32 bg-purple-400 dark:bg-purple-600 bottom-10 left-1/3 animate-pulse" style={{ animationDelay: '2s' }} />
        <AnimatedShape className="w-24 h-24 bg-cyan-400 dark:bg-cyan-600 top-1/2 right-1/4 animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative px-6 sm:px-8 lg:px-16 py-10 sm:py-14 md:py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            {/* <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20 dark:border-white/10">
              <FireOutlined className="text-orange-400" />
              <span className="text-white/90 text-sm font-medium">{t('hero.badge', 'Kho prompt AI hàng đầu')}</span>
            </div> */}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 dark:text-white/70 max-w-2xl mx-auto leading-relaxed px-4 mb-6">
              {t('hero.subtitle')}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2 sm:gap-3 items-center">
                <Input
                  size="large"
                  placeholder={t('hero.searchPlaceholder', 'Tìm kiếm prompts...')}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1 rounded-xl sm:rounded-2xl text-base border-0 shadow-lg [&>input]:h-12 [&>input]:sm:h-14 [&>input]:text-base [&_input]:border-0"
                  onPressEnter={handleSearch}
                  style={{ height: 'auto' }}
                />
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  className="rounded-xl sm:rounded-2xl px-6 sm:px-8 bg-white text-blue-600 hover:!bg-white/90 border-0 shadow-lg font-semibold flex-shrink-0"
                  style={{ height: '48px' }}
                >
                  {t('hero.search', 'Tìm kiếm')}
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-16">
              <StatItem
                icon={<FolderOutlined />}
                value={stats.categories || 0}
                label={t('hero.stats.categories', 'Danh mục')}
              />
              <div className="w-px h-10 sm:h-12 bg-white/20" />
              <StatItem
                icon={<FireOutlined />}
                value={`${stats.approved_prompts || 0}+`}
                label={t('hero.stats.prompts', 'Prompts')}
              />
              <div className="w-px h-10 sm:h-12 bg-white/20" />
              <StatItem
                icon={<TagOutlined />}
                value={`${(stats.total_views || 0).toLocaleString()}`}
                label={t('hero.stats.views', 'Lượt xem')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
