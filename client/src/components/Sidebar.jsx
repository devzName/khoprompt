import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from './shared/Logo';
import { ROUTES } from '../constants/routes';

const Sidebar = ({ menuItems, activeTab, isMobile = false, onClose = null }) => {
  const navigate = useNavigate();

  // Collapse state — desktop only; persisted in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const handleMenuClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    if (isMobile && onClose) onClose();
  };

  const getActiveClass = (itemKey) => {
    const isActive =
      (itemKey === 'dashboard' && activeTab === 'dashboard') ||
      (itemKey === 'my-prompts' && activeTab === 'list') ||
      (itemKey === 'create-prompt' && activeTab === 'create') ||
      (itemKey === 'manage' && activeTab === 'manage') ||
      (itemKey === 'login-management' && activeTab === 'login-management') ||
      (itemKey === 'review-prompts' && activeTab === 'review') ||
      (itemKey === activeTab); // direct key match for admin pages
    return isActive
      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f1f1f]';
  };

  // Mobile sidebar — always full, no collapse
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
        <nav className="flex-1 px-4 py-2">
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
      </div>
    );
  }

  // Desktop sidebar — collapsible
  return (
    <div
      className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 bg-white dark:bg-[#141414] border-r dark:border-gray-700 h-screen flex flex-col flex-shrink-0`}
    >
      {/* Logo area */}
      <div className={`p-4 border-b dark:border-gray-700 flex items-center ${collapsed ? 'justify-center' : ''}`}>
        {collapsed ? (
          <button onClick={() => navigate(ROUTES.HOME)} className="hover:opacity-80 transition-opacity" aria-label="Home">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </button>
        ) : (
          <Logo size="medium" onClick={() => navigate(ROUTES.HOME)} />
        )}
      </div>

      {/* Nav menu */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Tooltip
              key={item.key}
              title={collapsed ? item.label : ''}
              placement="right"
            >
              <button
                onClick={item.action}
                className={`flex items-center gap-3 rounded-lg text-sm transition-colors w-full text-left
                  ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'}
                  ${getActiveClass(item.key)}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            </Tooltip>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className={`border-t dark:border-gray-700 p-2 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          size="small"
        />
      </div>
    </div>
  );
};

export default Sidebar;
