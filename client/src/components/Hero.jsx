import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-8 sm:mb-12">
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 overflow-hidden rounded-2xl shadow-xl">
        <div className="relative px-6 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed px-4">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
