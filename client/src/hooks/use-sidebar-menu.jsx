import {
  DashboardOutlined,
  FileTextOutlined,
  PlusOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserSwitchOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { ROUTES } from '../constants/routes';

/**
 * Returns a consistent sidebar menuItems array for all pages.
 *
 * @param {string} activeTab - Current active tab key (matches item.key or page identifier)
 * @param {object|null} user - Authenticated user object
 * @param {function} navigate - React Router navigate function
 * @param {function|null} onCreatePrompt - Optional callback for create-prompt action (MyPromptsPage only)
 * @param {function} t - i18next translate function
 * @returns {Array} menuItems array compatible with Sidebar component
 */
export function useSidebarMenu(activeTab, user, navigate, onCreatePrompt, t) {
  const isAdmin = user?.user_type === 'admin';

  /**
   * Helper: returns null action and disabled=true when key matches activeTab,
   * otherwise returns the provided action.
   */
  const item = (key, icon, labelKey, labelFallback, action) => ({
    key,
    icon,
    label: t(labelKey, labelFallback),
    disabled: activeTab === key,
    action: activeTab === key ? null : action,
  });

  return [
    // Dashboard — admin only
    ...(isAdmin
      ? [item('dashboard', <DashboardOutlined />, 'sidebar.dashboard', 'Dashboard',
          () => navigate(ROUTES.MY_PROMPTS_DASHBOARD))]
      : []),

    // My Prompts
    item(
      'my-prompts',
      <FileTextOutlined />,
      'sidebar.myPrompts',
      'Prompts của tôi',
      () => navigate(ROUTES.MY_PROMPTS),
    ),

    // Create Prompt
    item(
      'create-prompt',
      <PlusOutlined />,
      'myPrompts.createPrompt.title',
      'Tạo Prompt',
      () => {
        if (onCreatePrompt) {
          onCreatePrompt();
        }
        navigate(ROUTES.MY_PROMPTS_CREATE);
      },
    ),

    // Admin-only items
    ...(isAdmin
      ? [
          // Manage Prompt (admin prompts page)
          item('admin-prompts', <AppstoreOutlined />, 'sidebar.adminPrompts', 'Quản lý Prompt',
            () => navigate(ROUTES.ADMIN_PROMPTS)),

          // Manage Categories & Tags
          item('manage', <TagsOutlined />, 'manageCategoriesTags.title', 'Manage Categories & Tags',
            () => navigate(`${ROUTES.MY_PROMPTS}?tab=manage`)),

          // Login Management
          item('login-management', <UserSwitchOutlined />, 'sidebar.loginManagement', 'Quản lý đăng nhập',
            () => navigate(`${ROUTES.MY_PROMPTS}?tab=login-management`)),

          // Audit Logs
          item('audit-logs', <AuditOutlined />, 'sidebar.auditLogs', 'Audit Logs',
            () => navigate(ROUTES.ADMIN_AUDIT_LOGS)),
        ]
      : []),
  ];
}
