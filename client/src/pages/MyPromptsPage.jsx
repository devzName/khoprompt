import { Drawer } from 'antd';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';
import PromptsList from '../components/prompts/PromptsList';
import { useMyPrompts } from '../hooks/useMyPrompts.jsx';

const MyPromptsPage = () => {
  const {
    user,
    searchValue,
    mobileMenuOpen,
    activeTab,
    form,
    loading,
    prompts,
    predefinedTags,
    categories,
    menuItems,
    setMobileMenuOpen,
    setActiveTab,
    handleCreatePrompt,
    handleSubmitPrompt,
    handleSubmitForReview,
    handleLogout,
    handleSearchChange,
  } = useMyPrompts();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar user={user} onLogout={handleLogout} menuItems={menuItems} activeTab={activeTab} />
      </div>

      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="lg:hidden"
        size={280}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onClose={() => setMobileMenuOpen(false)}
          menuItems={menuItems}
          activeTab={activeTab}
          isMobile={true}
        />
      </Drawer>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'list' ? (
          <PromptsList
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onCreatePrompt={handleCreatePrompt}
            onMenuClick={() => setMobileMenuOpen(true)}
            prompts={prompts}
            loading={loading}
            onSubmitPrompt={handleSubmitForReview}
          />
        ) : (
          <CreatePromptForm
            form={form}
            loading={loading}
            categories={categories}
            predefinedTags={predefinedTags}
            onSubmit={handleSubmitPrompt}
            onCancel={() => setActiveTab('list')}
            onMenuClick={() => setMobileMenuOpen(true)}
          />
        )}
      </div>
    </div>
  );
};

export default MyPromptsPage;