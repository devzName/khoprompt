import { useState } from 'react';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSidebarMenu } from '../../hooks/use-sidebar-menu.jsx';
import Sidebar from '../Sidebar';

/**
 * Shared layout for all admin pages.
 * Renders the admin sidebar (desktop) and a drawer (mobile),
 * then renders children in the main content area.
 */
const AdminLayout = ({ activeTab, children }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = useSidebarMenu(activeTab, user, navigate, null, t, true);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar menuItems={menuItems} activeTab={activeTab} />
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="lg:hidden"
        width={208}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar
          menuItems={menuItems}
          activeTab={activeTab}
          isMobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      {/* Main content — children receive onMenuClick to open mobile drawer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {typeof children === 'function'
          ? children({ onMenuClick: () => setMobileMenuOpen(true) })
          : children}
      </div>
    </div>
  );
};

export default AdminLayout;
