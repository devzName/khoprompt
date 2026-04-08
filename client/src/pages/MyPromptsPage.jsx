import { useState } from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import Sidebar from '../components/Sidebar';
import MyPromptsList from '../components/my-prompts/my-prompts-list';

const MyPromptsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCreatePrompt = () => navigate(ROUTES.MY_PROMPTS_CREATE);
  const handleEditPrompt = (prompt) => navigate(ROUTES.MY_PROMPTS_EDIT(prompt.id));

  const menuItems = useSidebarMenu('my-prompts', user, navigate, handleCreatePrompt, t);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-[#0d0d0d]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar menuItems={menuItems} activeTab="my-prompts" />
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={208}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar
          menuItems={menuItems}
          activeTab="my-prompts"
          isMobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MyPromptsList
          onCreatePrompt={handleCreatePrompt}
          onEditPrompt={handleEditPrompt}
          onMenuClick={() => setMobileMenuOpen(true)}
          currentUser={user}
        />
      </div>
    </div>
  );
};

export default MyPromptsPage;
