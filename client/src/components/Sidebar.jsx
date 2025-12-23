import { Link, useLocation } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants/routes';

const Sidebar = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { key: 'overview', icon: <HomeOutlined />, label: t('sidebar.overview'), path: ROUTES.DASHBOARD },
    { key: 'my-prompts', icon: <FileTextOutlined />, label: t('sidebar.myPrompts'), path: ROUTES.MY_PROMPTS },
    { key: 'prompt-kits', icon: <AppstoreOutlined />, label: t('sidebar.promptKits'), path: ROUTES.PROMPT_KITS },
  ];

  const marketplaceItems = [
    { key: 'marketplace', icon: <ShoppingOutlined />, label: t('sidebar.orders'), path: ROUTES.ORDERS },
    { key: 'history', icon: <HistoryOutlined />, label: t('sidebar.paymentHistory'), path: ROUTES.PAYMENT_HISTORY },
    { key: 'revenue', icon: <DollarOutlined />, label: t('sidebar.revenue'), path: ROUTES.REVENUE },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('sidebar.profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('sidebar.logout'),
      danger: true,
      onClick: onLogout,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="KhoPrompt" className="w-8 h-8" />
          <span className="text-lg font-bold text-gray-900">KhoPrompt</span>
        </Link>
      </div>

      <div className="p-4">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          <ArrowLeftOutlined />
          <span>{t('sidebar.backToHome')}</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 space-y-1">
          {marketplaceItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Avatar size={40} src={user?.picture} className="shrink-0">
              {user?.name?.[0] || 'U'}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Sidebar;
