import { Drawer } from 'antd';
import Sidebar from '../components/Sidebar';
import ReviewPromptsList from '../components/prompts/ReviewPromptsList';
import { useReviewPrompts } from '../hooks/useReviewPrompts.jsx';

const ReviewPromptsPage = () => {
    const {
        user,
        mobileMenuOpen,
        loading,
        prompts,
        menuItems,
        setMobileMenuOpen,
        handleApprove,
        handleReject,
        handleLogout,
    } = useReviewPrompts();

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="hidden lg:block">
                <Sidebar user={user} onLogout={handleLogout} menuItems={menuItems} activeTab="review-list" />
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
                    activeTab="review-list"
                    isMobile={true}
                />
            </Drawer>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <ReviewPromptsList
                    prompts={prompts}
                    loading={loading}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                    onMenuClick={() => setMobileMenuOpen(true)}
                />
            </div>
        </div>
    );
};

export default ReviewPromptsPage;
