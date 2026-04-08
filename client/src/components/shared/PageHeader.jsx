import { Button, Breadcrumb, Avatar, Tag, Dropdown } from 'antd';
import { MenuOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { createUserMenuItems } from '../../utils/userMenuUtils.jsx';

const PageHeader = ({ title, description, breadcrumb, onMenuClick, children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { getLanguageMenuItems } = useLanguage();

  const userMenuItems = createUserMenuItems(t, getLanguageMenuItems, logout, false, user);

  const breadcrumbItems = breadcrumb
    ? [
        { title: <Link to={ROUTES.HOME}><HomeOutlined /></Link> },
        { title: breadcrumb },
      ]
    : null;

  const UserDropdown = () => {
    if (!user) return null;
    return (
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1f1f1f] rounded-lg px-2 py-1 transition-colors shrink-0">
          <Avatar size="small" src={user.picture || undefined} className="bg-purple-600 shrink-0">
            {!user.picture && (user.username?.[0] || user.name?.[0] || 'U').toUpperCase()}
          </Avatar>
          <div className="hidden lg:flex flex-col leading-tight">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {user.name || user.username || user.email}
            </span>
            {user.user_type === 'admin' && (
              <Tag color="purple" className="text-xs w-fit mt-0.5">Admin</Tag>
            )}
          </div>
        </div>
      </Dropdown>
    );
  };

  return (
    <div className="bg-white dark:bg-[#141414] border-b dark:border-gray-700 px-4 sm:px-6 py-4 shrink-0">
      {/* Mobile header row */}
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
        <UserDropdown />
      </div>

      {/* Desktop header row */}
      <div className="hidden lg:flex items-start justify-between">
        <div>
          {breadcrumbItems && (
            <Breadcrumb items={breadcrumbItems} className="mb-2" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          {description && <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>}
        </div>
        <div className="ml-auto mt-1">
          <UserDropdown />
        </div>
      </div>

      {children}
    </div>
  );
};

export default PageHeader;
