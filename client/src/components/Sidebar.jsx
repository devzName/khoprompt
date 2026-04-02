import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import UserProfile from './shared/UserProfile';
import { ROUTES } from '../constants/routes';
const Sidebar = ({ user, onLogout, menuItems, activeTab, isMobile = false, onClose = null }) => {
  const navigate = useNavigate();
  const { t, getLanguageMenuItems } = useLanguage();
  const userMenuItems = createUserMenuItems(t, getLanguageMenuItems, onLogout, false, user);
  const handleMenuClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    if (isMobile && onClose) onClose();
  };
  const getActiveClass = (itemKey) => {
    const isActive = (itemKey === 'dashboard' && activeTab === 'dashboard') ||
      (itemKey === 'my-prompts' && activeTab === 'list') ||
      (itemKey === 'create-prompt' && activeTab === 'create') ||
      (itemKey === 'manage' && activeTab === 'manage') ||
      (itemKey === 'login-management' && activeTab === 'login-management') ||
      (itemKey === 'review-prompts' && activeTab === 'review');
    return isActive
      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f1f1f]';
  };
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#141414]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Logo size="medium" onClick={() => navigate(ROUTES.HOME)} />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              size="small"
            />
          </div>
        </div>
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors w-full text-left ${getActiveClass(item.key)}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        {user && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <UserProfile user={user} menuItems={userMenuItems} placement="top" size={40} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="w-64 bg-white dark:bg-[#141414] border-r dark:border-gray-700 h-screen flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <Logo size="medium" onClick={() => navigate(ROUTES.HOME)} />
      </div>
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={item.action}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${getActiveClass(item.key)}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t dark:border-gray-700">
        <UserProfile user={user} menuItems={userMenuItems} placement="topRight" size={40} />
      </div>
    </div>
  );
};
export default Sidebar;