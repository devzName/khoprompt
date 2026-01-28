import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const PageHeader = ({ title, description, breadcrumb, onMenuClick, children }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border-b px-4 sm:px-6 py-4 shrink-0">
      <div className="flex items-center justify-between lg:hidden mb-4">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          className="text-gray-600 hover:text-gray-900"
          size="large"
        />
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <div className="w-10" />
      </div>
      <div className="hidden lg:block">
        {}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
      </div>
      {children}
    </div>
  );
};
export default PageHeader;