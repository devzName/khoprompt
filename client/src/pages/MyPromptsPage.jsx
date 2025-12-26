import { useState, useEffect } from 'react';
import { Drawer, Form, message } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { promptService } from '../services/promptService';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';
import PromptsList from '../components/prompts/PromptsList';

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
  const [hasLoadedPrompts, setHasLoadedPrompts] = useState(false);

  // Fetch user's prompts
  useEffect(() => {
    if (user?.id && activeTab === 'list' && !hasLoadedPrompts) {
      fetchMyPrompts();
    }
  }, [user?.id, activeTab, hasLoadedPrompts]);

  const fetchMyPrompts = async () => {
    try {
      setLoading(true);
      const data = await promptService.getMyPrompts();
      setPrompts(data);
      setHasLoadedPrompts(true);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      message.error(t('myPrompts.errorFetching', 'Error fetching prompts'));
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
      category_id: prompt.category_id,
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
        message.success(t('myPrompts.editPrompt.success', 'Prompt updated successfully'));
      } else {
        await promptService.createPrompt(values);
        message.success(t('myPrompts.createPrompt.success'));
      }

      form.resetFields();
      setEditingPrompt(null);
      setActiveTab('list');
      setHasLoadedPrompts(false); // Reset để load lại data
      fetchMyPrompts(); // Refresh the list
    } catch (error) {
      console.error('Error saving prompt:', error);
      message.error(t('myPrompts.createPrompt.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      setLoading(true);
      
      await promptService.submitPrompt(id);
      message.success(t('myPrompts.submitSuccess'));
      setHasLoadedPrompts(false); // Reset để load lại data
      fetchMyPrompts(); // Refresh the list
    } catch (error) {
      console.error('Error submitting prompt:', error);
      message.error(t('myPrompts.submitError'));
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
          setHasLoadedPrompts(false); // Reset để load lại data khi chuyển về tab list
        }
      }
    },
    { key: 'create-prompt', icon: <PlusOutlined />, label: t('myPrompts.createPrompt.title'), action: () => handleCreatePrompt() },
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