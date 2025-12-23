import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (value) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      size="large"
      className="w-24"
      suffixIcon={<GlobalOutlined />}
      options={[
        { value: 'vi', label: 'VI' },
        { value: 'en', label: 'EN' },
      ]}
    />
  );
};

export default LanguageSwitcher;
