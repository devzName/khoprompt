import { useState, useEffect, useCallback } from 'react';
import { Form, message } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';

export const useMyPrompts = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [predefinedTags, setPredefinedTags] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/prompt-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.map(cat => ({ label: cat.name, value: cat.id, slug: cat.slug })));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/prompt-tags');
      if (response.ok) {
        const data = await response.json();
        setPredefinedTags(data.map(tag => tag.name));
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  const fetchMyPrompts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/prompts?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      message.error(t('myPrompts.errorFetching'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  useEffect(() => {
    if (user && activeTab === 'list') {
      fetchMyPrompts();
    }
  }, [user, activeTab, fetchMyPrompts]);

  const handleCreatePrompt = () => {
    setActiveTab('create');
  };

  const handleSubmitPrompt = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Find category name for compatibility
      const categoryObj = categories.find(c => c.value === values.category);

      const payload = {
        title: values.title,
        description: values.description,
        content: values.content,
        category_id: values.category,
        category: categoryObj ? categoryObj.label : 'General',
        tags: values.tags || [],
        full_description: values.notes || ""
      };

      const response = await fetch('/api/v1/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create prompt');
      }

      message.success(t('myPrompts.createPrompt.success'));
      form.resetFields();
      setActiveTab('list');
      fetchMyPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
      message.error(error.message || t('myPrompts.createPrompt.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/v1/prompts/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to submit prompt');
      }

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
    predefinedTags,
    categories,
    menuItems,

    // Actions
    setMobileMenuOpen,
    setActiveTab,
    handleCreatePrompt,
    handleSubmitPrompt,
    handleSubmitForReview,
    handleLogout,
    handleSearchChange,
  };
};