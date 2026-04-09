import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Popover, Empty } from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  BellOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { useDarkMode } from '../hooks/use-dark-mode';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import { ROUTES } from '../constants/routes';
import NotificationBadge from './NotificationBadge';
import { useNotifications } from '../hooks/useNotifications';

const NotificationPanel = ({ onViewAll }) => {
  const { notifications, unreadCount, markRead } = useNotifications();
  const navigate = useNavigate();
  const recent = notifications.slice(0, 5);

  return (
    <div className="w-80 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-100 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/8">
        <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
        {unreadCount > 0 && (
          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
        {recent.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
            <BellOutlined className="text-2xl" />
            <span className="text-sm">No notifications</span>
          </div>
        ) : (
          recent.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                ${n.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-gray-50 dark:hover:bg-white/3'}`}
              onClick={() => n.status === 'unread' && markRead(n.id)}
            >
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.status === 'unread' ? 'bg-blue-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {n.notification?.title || n.title}
                </p>
                <p
                  className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-2 mt-0.5"
                  dangerouslySetInnerHTML={{ __html: n.notification?.content || n.content || '' }}
                />
              </div>
              {n.status === 'unread' && (
                <button
                  onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                  className="shrink-0 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-400 transition-colors"
                  title="Mark as read"
                >
                  <CheckOutlined className="text-xs" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-white/8 px-4 py-2.5">
        <button
          onClick={() => { navigate('/notifications'); onViewAll?.(); }}
          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { t, getLanguageMenuItems } = useLanguage();
  const [isDark, setIsDark] = useDarkMode();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('logout'));
  };

  const userMenuItems = createUserMenuItems(t, getLanguageMenuItems, handleLogout, true, user);

  return (
    <header className="sticky top-0 z-50
      border-b border-gray-100 dark:border-white/6
      bg-white dark:bg-[#111] backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 shrink-0 hover:opacity-70 transition-opacity duration-150"
          >
            <Logo size="small" />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">

            {/* Playground */}
            <button
              onClick={() => navigate(ROUTES.PLAYGROUND)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/6
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              <ThunderboltOutlined aria-hidden="true" />
              Playground
            </button>

            <button
              onClick={() => navigate(ROUTES.PROMPTS)}
              className="px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/6
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              {t('header.prompts', 'Prompts')}
            </button>

            <button
              onClick={() => navigate(ROUTES.BOOKMARKED)}
              className="px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/6
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              {t('bookmarked.title', 'Bookmarks')}
            </button>

            <button
              onClick={() => navigate(ROUTES.SKILLS)}
              className="px-3 py-1.5 rounded-md text-sm
                text-gray-500 dark:text-neutral-400
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/6
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              {t('skills.title', 'Skills')}
            </button>

            {/* Admin Panel */}
            {user?.user_type === 'admin' && (
              <button
                onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                  text-orange-500 dark:text-orange-400
                  hover:text-orange-600 dark:hover:text-orange-300
                  hover:bg-orange-50 dark:hover:bg-orange-900/20
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40
                  transition-colors duration-150"
              >
                <DashboardOutlined aria-hidden="true" />
                Admin
              </button>
            )}

            {/* Divider */}
            {/* <span aria-hidden="true" className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1.5" /> */}

            {/* Create — high-contrast CTA */}
            {/* <button
              onClick={() => navigate(ROUTES.MY_PROMPTS_CREATE)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                bg-blue-600 dark:bg-blue-600
                text-white dark:text-white
                hover:bg-blue-700 dark:hover:bg-blue-700
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 dark:focus-visible:ring-blue-600/40
                transition-colors duration-150"
            >
              <PlusOutlined aria-hidden="true" />
              {t('header.createPrompt', 'Create')}
            </button> */}
          </nav>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-md
              text-gray-400 dark:text-neutral-500
              hover:text-black dark:hover:text-white
              hover:bg-gray-100 dark:hover:bg-white/6
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
              transition-colors duration-150"
          >
            {isDark
              ? <SunOutlined aria-hidden="true" className="text-sm" />
              : <MoonOutlined aria-hidden="true" className="text-sm" />}
          </button>

          {/* Notification Popover */}
          <Popover
            content={<NotificationPanel onViewAll={() => {}} />}
            trigger="click"
            placement="bottomRight"
            arrow={false}
            overlayInnerStyle={{ padding: 0, borderRadius: 12 }}
            overlayStyle={{ paddingTop: 8 }}
          >
            <button
              className="relative p-2 rounded-md
                text-gray-400 dark:text-neutral-500
                hover:text-black dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/6
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
                transition-colors duration-150"
            >
              <BellOutlined aria-hidden="true" className="text-sm" />
              <NotificationBadge count={unreadCount} />
            </button>
          </Popover>

          {/* Avatar / user menu */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <button
              aria-label="Open user menu"
              className="cursor-pointer rounded-full
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#111]
                hover:opacity-75 transition-opacity duration-150"
            >
              <Avatar
                size={28}
                src={user?.picture}
                className="border border-gray-200 dark:border-white/10"
              />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
