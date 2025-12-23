import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Avatar, Dropdown } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  LogoutOutlined,
  BookOutlined
} from '@ant-design/icons';

const Header = () => {
  const [searchValue, setSearchValue] = useState('');

  const userMenuItems = [
    {
      key: 'my-prompts',
      icon: <BookOutlined />,
      label: 'Prompts của tôi',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt="Prompt Library Logo" 
                className="w-14 h-14 object-contain"
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900 block leading-tight">
                  Prompt Library
                </span>
                <span className="text-xs text-gray-500 block leading-tight">
                  AI Prompt Collection
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 lg:mx-8">
            <Input
              size="large"
              placeholder="Tìm kiếm prompt, tác giả, tag..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="rounded-xl border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm"
              allowClear
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Create Prompt Button */}
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all rounded-xl font-medium"
            >
              <span className="hidden sm:inline ml-1">Tạo Prompt</span>
            </Button>

            {/* User Avatar */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors">
                <Avatar
                  size={36}
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                  className="border-2 border-gray-200"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">admin@company.com</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4 pt-2">
          <Input
            size="middle"
            placeholder="Tìm kiếm prompt, tác giả, tag..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="rounded-xl border-gray-300 shadow-sm"
            allowClear
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
