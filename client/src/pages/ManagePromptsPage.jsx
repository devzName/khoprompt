import { Drawer } from 'antd';
import Sidebar from '../components/Sidebar';
import ManagePromptsList from '../components/prompts/ManagePromptsList';
import { useManagePrompts } from '../hooks/useManagePrompts';
import { useReviewPrompts } from '../hooks/useReviewPrompts'; // Reuse hook for shared sidebar logic if possible, or create new

const ManagePromptsPage = () => {
    // We need user and logout logic from somewhere. 
    // Ideally we should have a useUser or useAuth hook.
    // reusing logic from useReviewPrompts for now or duplicating sidebar setup.
    const {
        user,
        menuItems,
        handleLogout,
        setMobileMenuOpen: setSidebarMobileOpen,
        mobileMenuOpen: sidebarMobileOpen
    } = useReviewPrompts(); // HACK: reusing this hook just for sidebar logic

    const {
        loading,
        prompts,
        searchValue,
        setSearchValue,
        handleDelete,
        handleArchive,
        refresh
    } = useManagePrompts();

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="hidden lg:block">
                <Sidebar user={user} onLogout={handleLogout} menuItems={menuItems} activeTab="manage-prompts" />
            </div>

            <Drawer
                title={null}
                placement="left"
                onClose={() => setSidebarMobileOpen(false)}
                open={sidebarMobileOpen}
                className="lg:hidden"
                size={280}
                styles={{ body: { padding: 0 } }}
                closeIcon={null}
            >
                <Sidebar
                    user={user}
                    onLogout={handleLogout}
                    onClose={() => setSidebarMobileOpen(false)}
                    menuItems={menuItems}
                    activeTab="manage-prompts"
                    isMobile={true}
                />
            </Drawer>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <ManagePromptsList
                    prompts={prompts}
                    loading={loading}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onMenuClick={() => setSidebarMobileOpen(true)}
                    handleDelete={handleDelete}
                    handleArchive={handleArchive}
                />
            </div>
        </div>
    );
};

export default ManagePromptsPage;
