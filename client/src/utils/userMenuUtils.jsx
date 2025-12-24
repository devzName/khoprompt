import { LogoutOutlined, GlobalOutlined, BookOutlined, AuditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const createUserMenuItems = (t, getLanguageMenuItems, onLogout, includeMyPrompts = false, user = null) => {
  const items = [];

  const roles = user?.roles || [];
  const isSupervisorOrAdmin = roles.some(role => {
    const roleName = typeof role === 'string' ? role : (role?.name || role?.value || '');
    const normalizedRole = roleName.toLowerCase();
    return normalizedRole === 'supervisor' || normalizedRole === 'sup' || normalizedRole === 'admin';
  });

  // Add Review Prompts for Supervisor/Admin
  if (isSupervisorOrAdmin) {
    items.push(
      {
        key: 'review-prompts',
        icon: <AuditOutlined />,
        label: <Link to={ROUTES.REVIEW_PROMPTS}>{t('header.reviewPrompts')}</Link>,
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