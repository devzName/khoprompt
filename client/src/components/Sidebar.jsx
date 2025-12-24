import { Button } from 'antd';
import { ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import UserProfile from './shared/UserProfile';
import { ROUTES } from '../constants/routes';

const Sidebar = ({ user, onLogout, menuItems, activeTab, isMobile = false, onClose = null }) => {
  const navigate = useNavigate();
  const { t, getLanguageMenuItems } = useLanguage();
  const userMenuItems = createUserMenuItems(t, getLanguageMenuItems, onLogout);

  const handleMenuClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    if (isMobile && onClose) onClose();
  };

  const handleBackToHome = () => {
    navigate(ROUTES.HOME);
    if (isMobile && onClose) onClose();
  };

  const getActiveClass = (itemKey) => {
    const isActive = (itemKey === 'my-prompts' && activeTab === 'list') || 
                    (itemKey === 'create-prompt' && activeTab === 'create');
    return isActive 
      ? 'bg-blue-50 text-blue-600 font-medium'
      : 'text-gray-700 hover:bg-gray-50';
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Logo size="medium" />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
              size="small"
            />
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm w-full text-left transition-colors"
          >
            <ArrowLeftOutlined />
            <span>{t('sidebar.backToHome')}</span>
          </button>
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
          <div className="p-4 border-t border-gray-100">
            <UserProfile user={user} menuItems={userMenuItems} placement="topCenter" size={40} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <Logo size="medium" onClick={() => navigate(ROUTES.HOME)} />
      </div>

      <div className="p-4">
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm w-full text-left transition-colors"
        >
          <ArrowLeftOutlined />
          <span>{t('sidebar.backToHome')}</span>
        </button>
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

      <div className="p-4 border-t">
        <UserProfile user={user} menuItems={userMenuItems} placement="topRight" size={40} />
      </div>
    </div>
  );
};

export default Sidebar;