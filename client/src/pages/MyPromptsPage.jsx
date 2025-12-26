import { useState, useEffect } from 'react';
import { Drawer, Form, notification } from 'antd';
import { FileTextOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { promptService } from '../services/promptService';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';
import PromptsList from '../components/prompts/PromptsList';
import ReviewPromptsList from '../components/prompts/ReviewPromptsList';

const MyPromptsPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [pendingPrompts, setPendingPrompts] = useState([]);
  const [hasLoadedPrompts, setHasLoadedPrompts] = useState(false);

  useEffect(() => {
    if (user?.id && activeTab === 'list' && !hasLoadedPrompts) {
      fetchMyPrompts();
    } else if (user?.user_type === 'admin' && activeTab === 'review' && !hasLoadedPrompts) {
      fetchPendingPrompts();
    }
  }, [user?.id, user?.user_type, activeTab, hasLoadedPrompts]);

  const fetchMyPrompts = async () => {
    try {
      setLoading(true);
      const data = await promptService.getMyPrompts();
      setPrompts(data);
      setHasLoadedPrompts(true);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('myPrompts.errorFetching', 'Error fetching prompts'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPrompts = async () => {
    try {
      setLoading(true);
      const data = await promptService.getPendingPrompts();
      setPendingPrompts(data);
      setHasLoadedPrompts(true);
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
      setHasLoadedPrompts(false);
      fetchMyPrompts();
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
      setHasLoadedPrompts(false);
      fetchMyPrompts();
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
      setHasLoadedPrompts(false);
      fetchMyPrompts();
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
      setHasLoadedPrompts(false);
      fetchPendingPrompts();
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
      setHasLoadedPrompts(false);
      fetchPendingPrompts();
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

  const handleLogout = () => {
    logout(() => setMobileMenuOpen(false));
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const menuItems = [
    { 
      key: 'my-prompts', 
      icon: <FileTextOutlined />, 
      label: t('sidebar.myPrompts'), 
      action: () => {
        setActiveTab('list');
        if (activeTab !== 'list') {
          setHasLoadedPrompts(false);
        }
      }
    },
    { key: 'create-prompt', icon: <PlusOutlined />, label: t('myPrompts.createPrompt.title'), action: () => handleCreatePrompt() },
    // Admin only menu
    ...(user?.user_type === 'admin' ? [{
      key: 'review-prompts',
      icon: <CheckCircleOutlined />,
      label: t('sidebar.reviewPrompts'),
      action: () => {
        setActiveTab('review');
        setHasLoadedPrompts(false);
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
            onCreatePrompt={handleCreatePrompt}
            onMenuClick={() => setMobileMenuOpen(true)}
            prompts={prompts}
            loading={loading}
            onSubmitPrompt={handleSubmitForReview}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            currentUser={user}
          />
        ) : activeTab === 'review' && user?.user_type === 'admin' ? (
          <ReviewPromptsList
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onMenuClick={() => setMobileMenuOpen(true)}
            prompts={pendingPrompts}
            loading={loading}
            onApprovePrompt={handleApprovePrompt}
            onRejectPrompt={handleRejectPrompt}
            currentUser={user}
          />
        ) : (
          <CreatePromptForm
            form={form}
            loading={loading}
            onSubmit={handleSubmitPrompt}
            onCancel={() => setActiveTab('list')}
            onMenuClick={() => setMobileMenuOpen(true)}
            isEditing={!!editingPrompt}
          />
        )}
      </div>
    </div>
  );
};

export default MyPromptsPage;