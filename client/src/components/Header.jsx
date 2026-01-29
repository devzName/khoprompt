import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button, Avatar, Dropdown } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { createUserMenuItems } from '../utils/userMenuUtils.jsx';
import Logo from './shared/Logo';
import { ROUTES } from '../constants/routes';
const { Search } = Input;
const Header = () => {
  const { t, getLanguageMenuItems } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    setSearchValue(queryFromUrl);
  }, [searchParams]);
  
  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(value.trim())}`);
    }
  };
  
  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  const handleSearchSubmit = (value) => {
    handleSearch(value);
  };
  
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
    window.dispatchEvent(new Event('logout'));
  };
  
  const userMenuItems = createUserMenuItems(t, getLanguageMenuItems, handleLogout, true, user);
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <div className="flex items-center shrink-0">
            <Link to={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
              <Logo size="large" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Search
                size="large"
                placeholder={t('header.search', 'Tìm kiếm prompts...')}
                value={searchValue}
                onChange={handleSearchInputChange}
                onSearch={handleSearchSubmit}
                style={{
                  borderRadius: '12px',
                  width: '400px'
                }}
                allowClear
              />
            </div>
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={() => navigate('/my-prompts?tab=create')}
              className="bg-gray-900 hover:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-all rounded-xl font-medium text-white"
            >
              <span className="hidden sm:inline ml-1">{t('header.createPrompt')}</span>
            </Button>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={['click']}
            >
              <div className="cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors">
                <Avatar size={36} src={user?.picture} className="border-2 border-gray-200" />
              </div>
            </Dropdown>
          </div>
        </div>
        <div className="md:hidden pb-4 pt-2">
          <Search
            size="middle"
            placeholder={t('header.search', 'Tìm kiếm prompts...')}
            value={searchValue}
            onChange={handleSearchInputChange}
            onSearch={handleSearchSubmit}
            style={{
              borderRadius: '12px',
            }}
            allowClear
          />
        </div>
      </div>
    </header>
  );
};
export default Header;
