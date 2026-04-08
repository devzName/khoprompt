import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { useDarkMode } from '../hooks/use-dark-mode';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import { ROUTES } from '../constants/routes';

const Header = () => {
  const { t, getLanguageMenuItems } = useLanguage();
  const [isDark, setIsDark] = useDarkMode();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
