import { useState, useEffect } from 'react';
import { Drawer, Form, notification } from 'antd';
import { FileTextOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { promptService } from '../services/promptService';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';
import PromptsList from '../components/prompts/PromptsList';
import ReviewPromptsList from '../components/prompts/ReviewPromptsList';

const MyPromptsPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [pendingPrompts, setPendingPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1); // Thêm state cho review pagination
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [totalPendingPrompts, setTotalPendingPrompts] = useState(0); // Thêm state cho total pending prompts
  const [initialLoading, setInitialLoading] = useState(true);

  // Kiểm tra query parameter để set activeTab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'create') {
      setActiveTab('create');
      setEditingPrompt(null);
      form.resetFields();
    } else if (tabFromUrl === 'review' && user?.user_type === 'admin') {
      setActiveTab('review');
    } else {
      setActiveTab('list');
    }
  }, [searchParams, form, user?.user_type]);

  useEffect(() => {
    if (user?.id && activeTab === 'list') {
      setCurrentPage(1);
      setInitialLoading(true);
      fetchMyPrompts(1);
    } else if (user?.user_type === 'admin' && activeTab === 'review') {
      setReviewCurrentPage(1);
      fetchPendingPrompts(1);
    }
  }, [user?.id, user?.user_type, activeTab]);

  const fetchMyPrompts = async (page = currentPage, search = searchValue) => {
    try {
      const params = {
        page: page,
        limit: 12
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await promptService.getMyPrompts(params);
      setPrompts(response.data || response);
      setTotalPrompts(response.pagination?.total || response.length);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('myPrompts.errorFetching', 'Error fetching prompts'),
        placement: 'topRight'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchPendingPrompts = async (page = reviewCurrentPage, search = '') => {
    try {
      setLoading(true);
      const params = {
        page: page,
        limit: 12
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await promptService.getPendingPrompts(params);
      setPendingPrompts(response.data || response);
      setTotalPendingPrompts(response.pagination?.total || response.length);
    } catch (error) {
      console.error('Error fetching pending prompts:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('reviewPrompts.errorFetching', 'Error fetching pending prompts'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    form.resetFields();
    setActiveTab('create');
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    form.setFieldsValue({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category_id,
      tags: prompt.tags?.map(tag => {
        const tagId = typeof tag === 'object' ? tag.id : tag;
        return tagId.toString();
      }) || [],
      full_description: prompt.full_description
    });
    setActiveTab('create');
  };

  const handleSubmitPrompt = async (values) => {
    try {
      setLoading(true);
      
      if (editingPrompt) {
        await promptService.updatePrompt(editingPrompt.id, values);
        notification.success({
          message: t('common.success', 'Success'),
          description: t('myPrompts.editPrompt.success', 'Prompt updated successfully'),
          placement: 'topRight'
        });
      } else {
        await promptService.createPrompt(values);
        notification.success({
          message: t('common.success', 'Success'),
          description: t('myPrompts.createPrompt.success'),
          placement: 'topRight'
        });
      }

      form.resetFields();
      setEditingPrompt(null);
      setActiveTab('list');
      navigate('/my-prompts'); // Cập nhật URL
      fetchMyPrompts(1);
    } catch (error) {
      console.error('Error saving prompt:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('myPrompts.createPrompt.error'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      setLoading(true);
      
      await promptService.submitPrompt(id);
      notification.success({
        message: t('common.success', 'Success'),
        description: t('myPrompts.submitSuccess'),
        placement: 'topRight'
      });
      fetchMyPrompts(1);
    } catch (error) {
      console.error('Error submitting prompt:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('myPrompts.submitError'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (id) => {
    try {
      setLoading(true);
      
      await promptService.deletePrompt(id);
      notification.success({
        message: t('common.success', 'Success'),
        description: t('myPrompts.deleteSuccess', 'Prompt deleted successfully'),
        placement: 'topRight'
      });
      fetchMyPrompts(1);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('myPrompts.deleteError', 'Error deleting prompt'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrompt = async (id) => {
    try {
      setLoading(true);
      
      await promptService.approvePrompt(id);
      notification.success({
        message: t('common.success', 'Success'),
        description: t('reviewPrompts.approveSuccess', 'Prompt approved successfully'),
        placement: 'topRight'
      });
      fetchPendingPrompts(reviewCurrentPage);
    } catch (error) {
      console.error('Error approving prompt:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('reviewPrompts.approveError', 'Error approving prompt'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPrompt = async (id) => {
    try {
      setLoading(true);
      
      await promptService.rejectPrompt(id);
      notification.success({
        message: t('common.success', 'Success'),
        description: t('reviewPrompts.rejectSuccess', 'Prompt rejected successfully'),
        placement: 'topRight'
      });
      fetchPendingPrompts(reviewCurrentPage);
    } catch (error) {
      console.error('Error rejecting prompt:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('reviewPrompts.rejectError', 'Error rejecting prompt'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMyPrompts(page);
  };

  const handleReviewPageChange = (page) => {
    setReviewCurrentPage(page);
    fetchPendingPrompts(page);
  };

  const handleLogout = () => {
    logout(() => setMobileMenuOpen(false));
  };

  // Search function - chỉ gọi khi nhấn Enter hoặc click search button
  const handleSearchSubmit = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
    fetchMyPrompts(1, value);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Search function cho review prompts
  const handleReviewSearchSubmit = (value) => {
    setSearchValue(value);
    setReviewCurrentPage(1);
    fetchPendingPrompts(1, value);
  };

  const menuItems = [
    { 
      key: 'my-prompts', 
      icon: <FileTextOutlined />, 
      label: t('sidebar.myPrompts'), 
      action: () => {
        setActiveTab('list');
        setCurrentPage(1);
        setSearchValue(''); // Reset search khi chuyển tab
        setInitialLoading(true);
        navigate('/my-prompts'); // Cập nhật URL
      }
    },
    { 
      key: 'create-prompt', 
      icon: <PlusOutlined />, 
      label: t('myPrompts.createPrompt.title'), 
      action: () => {
        handleCreatePrompt();
        navigate('/my-prompts?tab=create'); // Cập nhật URL
      }
    },
    // Admin only menu
    ...(user?.user_type === 'admin' ? [{
      key: 'review-prompts',
      icon: <CheckCircleOutlined />,
      label: t('sidebar.reviewPrompts'),
      action: () => {
        setActiveTab('review');
        setReviewCurrentPage(1);
        setSearchValue(''); // Reset search khi chuyển tab
        fetchPendingPrompts(1);
        navigate('/my-prompts?tab=review'); // Cập nhật URL
      }
    }] : [])
  ];

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
            onSearchSubmit={handleSearchSubmit}
            onCreatePrompt={handleCreatePrompt}
            onMenuClick={() => setMobileMenuOpen(true)}
            prompts={prompts}
            loading={initialLoading}
            onSubmitPrompt={handleSubmitForReview}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            currentUser={user}
            pagination={{
              current: currentPage,
              total: totalPrompts,
              pageSize: 12,
              onChange: handlePageChange,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
          />
        ) : activeTab === 'review' && user?.user_type === 'admin' ? (
          <ReviewPromptsList
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleReviewSearchSubmit}
            onMenuClick={() => setMobileMenuOpen(true)}
            prompts={pendingPrompts}
            loading={loading}
            onApprovePrompt={handleApprovePrompt}
            onRejectPrompt={handleRejectPrompt}
            currentUser={user}
            pagination={{
              current: reviewCurrentPage,
              total: totalPendingPrompts,
              pageSize: 12,
              onChange: handleReviewPageChange,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
          />
        ) : (
          <CreatePromptForm
            form={form}
            loading={loading}
            onSubmit={handleSubmitPrompt}
            onCancel={() => {
              setActiveTab('list');
              navigate('/my-prompts'); // Cập nhật URL
            }}
            onMenuClick={() => setMobileMenuOpen(true)}
            isEditing={!!editingPrompt}
          />
        )}
      </div>
    </div>
  );
};

export default MyPromptsPage;