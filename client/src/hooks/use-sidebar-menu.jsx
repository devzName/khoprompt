import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserSwitchOutlined,
  AuditOutlined,
  ToolOutlined,
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
export function useSidebarMenu(activeTab, user, navigate, _onCreatePrompt, t) {
  const isAdmin = user?.user_type === 'admin';

  const item = (key, icon, labelKey, labelFallback, action) => ({
    key,
    icon,
    label: t(labelKey, labelFallback),
    disabled: activeTab === key,
    action: activeTab === key ? null : action,
  });

  const section = (label) => ({ type: 'section', label });

  return [
    // --- My content ---
    ...(isAdmin
      ? [item('dashboard', <DashboardOutlined />, 'sidebar.dashboard', 'Dashboard',
          () => navigate(ROUTES.MY_PROMPTS_DASHBOARD))]
      : []),

    item('my-prompts', <FileTextOutlined />, 'sidebar.myPrompts', 'My Prompts',
      () => navigate(ROUTES.MY_PROMPTS)),

    item('skills', <ToolOutlined />, 'skills.title', 'Skills',
      () => navigate(ROUTES.SKILLS)),

    // --- Admin section ---
    ...(isAdmin
      ? [
          section('Admin'),

          item('admin-prompts', <AppstoreOutlined />, 'sidebar.adminPrompts', 'Manage Prompts',
            () => navigate(ROUTES.ADMIN_PROMPTS)),

          item('manage', <TagsOutlined />, 'manageCategoriesTags.title', 'Categories & Tags',
            () => navigate(`${ROUTES.MY_PROMPTS}?tab=manage`)),

          item('login-management', <UserSwitchOutlined />, 'sidebar.loginManagement', 'Login Management',
            () => navigate(`${ROUTES.MY_PROMPTS}?tab=login-management`)),

          item('audit-logs', <AuditOutlined />, 'sidebar.auditLogs', 'Audit Logs',
            () => navigate(ROUTES.ADMIN_AUDIT_LOGS)),
        ]
      : []),
  ];
}
