import { Button, Breadcrumb } from 'antd';
import { MenuOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';

const PageHeader = ({ title, description, breadcrumb, onMenuClick, children }) => {
  const { t } = useTranslation();

  // Build breadcrumb items: Home → current page
  const breadcrumbItems = breadcrumb
    ? [
        { title: <Link to={ROUTES.HOME}><HomeOutlined /></Link> },
        { title: breadcrumb },
      ]
    : null;

  return (
    <div className="bg-white dark:bg-[#141414] border-b dark:border-gray-700 px-4 sm:px-6 py-4 shrink-0">
      <div className="flex items-center justify-between lg:hidden mb-4">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          aria-label="Mở menu"
          size="large"
        />
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="w-10" />
      </div>
      <div className="hidden lg:block">
        {breadcrumbItems && (
          <Breadcrumb items={breadcrumbItems} className="mb-2" />
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        {description && <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>}
      </div>
      {children}
    </div>
  );
};
export default PageHeader;