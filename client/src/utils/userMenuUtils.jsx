import { LogoutOutlined, GlobalOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Avatar } from 'antd';
import { ROUTES } from '../constants/routes';

export const createUserMenuItems = (t, getLanguageMenuItems, onLogout, includeMyPrompts = false, user = null) => {
  const items = [];

  // Add user info at the top
  if (user) {
    items.push(
      {
        key: 'user-info',
        label: (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar size={40} src={user.picture} className="border-2 border-gray-200" />
            <div>
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        ),
        disabled: true,
      },
      {
        type: 'divider',
      }
    );
  }

  // Add My Prompts if needed (for Header)
  if (includeMyPrompts) {
    items.push(
      {
        key: 'my-prompts',
        icon: <BookOutlined />,
        label: <Link to={ROUTES.MY_PROMPTS}>{t('header.myPrompts')}</Link>,
      },
      {
        type: 'divider',
      }
    );
  }

  // Add Language submenu
  items.push(
    {
      key: 'language',
      icon: <GlobalOutlined />,
      label: t('sidebar.language'),
      children: getLanguageMenuItems(),
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
    }
  );

  return items;
};