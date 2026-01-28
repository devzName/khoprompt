import { useTranslation } from 'react-i18next';
export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };
  const getLanguageMenuItems = () => [
    {
      key: 'vi',
      label: t('sidebar.vietnamese'),
      onClick: () => changeLanguage('vi'),
    },
    {
      key: 'en',
      label: t('sidebar.english'),
      onClick: () => changeLanguage('en'),
    },
  ];
  return {
    t,
    i18n,
    changeLanguage,
    getLanguageMenuItems,
    currentLanguage: i18n.language,
    currentLanguageLabel: i18n.language === 'vi' ? 'VI' : 'EN',
  };
};