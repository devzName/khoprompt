import { LogoutOutlined, GlobalOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const createUserMenuItems = (t, getLanguageMenuItems, onLogout, includeMyPrompts = false, user = null) => {
  const items = [];

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