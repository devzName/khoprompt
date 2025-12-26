import { useState, useEffect, useCallback } from 'react';
import { Form, message } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';
import { promptService } from '../services/promptService';

export const useMyPrompts = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);

  const fetchMyPrompts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await promptService.getPrompts({ limit: 100 });
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      message.error(t('myPrompts.errorFetching'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user && activeTab === 'list') {
      fetchMyPrompts();
    }
  }, [user, activeTab, fetchMyPrompts]);

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
      category: prompt.categoryId || prompt.category_id,
      tags: prompt.tags || [],
      notes: prompt.full_description
    });
    setActiveTab('create'); // Re-use create tab UI for editing
  };

  const handleSubmitPrompt = async (values) => {
    try {
      setLoading(true);

      const payload = {
        title: values.title,
        description: values.description,
        content: values.content,
        category_id: values.category,
        category: values.category ? 'Selected Category' : 'General',
        tags: values.tags || [],
        tag_ids: [],
        full_description: values.notes || ""
      };

      if (editingPrompt) {
        await promptService.updatePrompt(editingPrompt.id, payload);
        message.success(t('myPrompts.editPrompt.success', 'Prompt updated successfully'));
      } else {
        await promptService.createPrompt(payload);
        message.success(t('myPrompts.createPrompt.success'));
      }

      form.resetFields();
      setEditingPrompt(null);
      setActiveTab('list');
      fetchMyPrompts();
    } catch (error) {
      console.error('Error saving prompt:', error);
      message.error(error.response?.data?.detail || t('myPrompts.createPrompt.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      setLoading(true);
      await promptService.submitPrompt(id);
      message.success(t('myPrompts.submitSuccess'));
      fetchMyPrompts();
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
    { key: 'my-prompts', icon: <FileTextOutlined />, label: t('sidebar.myPrompts'), action: () => setActiveTab('list') },
    { key: 'create-prompt', icon: <PlusOutlined />, label: t('myPrompts.createPrompt.title'), action: () => setActiveTab('create') },
  ];

  return {
    // State
    user,
    searchValue,
    mobileMenuOpen,
    activeTab,
    form,
    loading,
    prompts,
    menuItems,

    // Actions
    setMobileMenuOpen,
    setActiveTab,
    handleCreatePrompt,
    handleSubmitPrompt,
    handleSubmitForReview,
    handleLogout,
    handleSearchChange,
    handleEditPrompt,
    editingPrompt,
  };
};