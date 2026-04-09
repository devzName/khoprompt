import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserSwitchOutlined,
  AuditOutlined,
  ToolOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { ROUTES } from '../constants/routes';

/**
 * Returns a sidebar menu items array for all pages.
 * Supports section dividers: { type: 'section', label: 'SECTION NAME' }
 *
 * @param {string} activeTab
 * @param {object|null} user
 * @param {function} navigate
 * @param {function|null} _onCreatePrompt - unused, kept for backward compat
 * @param {function} t
 */
export function useSidebarMenu(activeTab, user, navigate, _onCreatePrompt, t, showAdmin = false) {
  const isAdmin = user?.user_type === 'admin' && showAdmin;

  const item = (key, icon, labelKey, labelFallback, action) => ({
    key,
    icon,
    label: t(labelKey, labelFallback),
    disabled: activeTab === key,
    action: activeTab === key ? null : action,
  });

  const section = (label) => ({ type: 'section', label });

  if (isAdmin) {
    return [
      item('dashboard', <DashboardOutlined />, 'sidebar.dashboard', 'Dashboard',
        () => navigate(ROUTES.ADMIN_DASHBOARD)),

      item('admin-prompts', <AppstoreOutlined />, 'sidebar.adminPrompts', 'Manage Prompts',
        () => navigate(ROUTES.ADMIN_PROMPTS)),

      item('manage', <TagsOutlined />, 'manageCategoriesTags.title', 'Categories & Tags',
        () => navigate(ROUTES.ADMIN_CATEGORIES)),

      item('login-management', <UserSwitchOutlined />, 'sidebar.loginManagement', 'Login Management',
        () => navigate(ROUTES.ADMIN_LOGIN_MANAGEMENT)),

      item('notifications', <BellOutlined />, 'sidebar.notifications', 'Notifications',
        () => navigate(ROUTES.ADMIN_NOTIFICATIONS)),

      item('audit-logs', <AuditOutlined />, 'sidebar.auditLogs', 'Audit Logs',
        () => navigate(ROUTES.ADMIN_AUDIT_LOGS)),
    ];
  }

  return [
    item('prompts', <AppstoreOutlined />, 'sidebar.prompts', 'Prompts',
      () => navigate(ROUTES.PROMPTS)),

    item('my-prompts', <FileTextOutlined />, 'sidebar.myPrompts', 'My Prompts',
      () => navigate(ROUTES.MY_PROMPTS)),

    item('my-skills', <ToolOutlined />, 'sidebar.mySkills', 'My Skills',
      () => navigate(ROUTES.MY_SKILLS)),
  ];
}
