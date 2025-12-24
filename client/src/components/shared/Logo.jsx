import { useTranslation } from 'react-i18next';

const Logo = ({ size = 'medium', onClick, className = '' }) => {
  const { t } = useTranslation();
  
  const sizes = {
    small: { img: 'w-8 h-8', title: 'text-lg', subtitle: 'text-xs' },
    medium: { img: 'w-8 h-8', title: 'text-lg', subtitle: 'text-xs' },
    large: { img: 'w-14 h-14', title: 'text-xl', subtitle: 'text-xs' },
  };

  const currentSize = sizes[size];

  const logoContent = (
    <>
      <img 
        src="/logo.png" 
        alt="Prompt Library Logo" 
        className={`${currentSize.img} object-contain`}
      />
      <div>
        <span className={`${currentSize.title} font-bold text-gray-900 block leading-tight`}>
          {t('header.title')}
        </span>
        <span className={`${currentSize.subtitle} text-gray-500 block leading-tight`}>
          {t('header.subtitle')}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`flex items-center gap-3 hover:opacity-80 transition-opacity w-full text-left ${className}`}
      >
        {logoContent}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoContent}
    </div>
  );
};

export default Logo;