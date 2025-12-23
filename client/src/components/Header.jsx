import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Avatar, Dropdown } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  LogoutOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LoginModal from './LoginModal';
import LanguageSwitcher from './LanguageSwitcher';
import { ROUTES } from '../constants/routes';

const Header = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const userMenuItems = [
    {
      key: 'my-prompts',
      icon: <BookOutlined />,
      label: <Link to={ROUTES.MY_PROMPTS}>{t('header.myPrompts')}</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('header.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt="Prompt Library Logo" 
                className="w-14 h-14 object-contain"
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900 block leading-tight">
                  {t('header.title')}
                </span>
                <span className="text-xs text-gray-500 block leading-tight">
                  {t('header.subtitle')}
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 lg:mx-8">
            <Input
              size="large"
              placeholder={t('header.search')}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="rounded-xl border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm"
              allowClear
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {!user && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all rounded-xl font-medium"
              >
                <span className="hidden sm:inline ml-1">{t('header.createPrompt')}</span>
              </Button>
            )}

            {user && (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors">
                  <Avatar
                    size={36}
                    src={user.picture}
                    className="border-2 border-gray-200"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </Dropdown>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4 pt-2">
          <Input
            size="middle"
            placeholder={t('header.search')}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm"
            allowClear
          />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        open={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={setUser}
      />
    </header>
  );
};

export default Header;
