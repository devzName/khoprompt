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
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [predefinedTags, setPredefinedTags] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await promptService.getCategories();
      setCategories(data.map(cat => ({ label: cat.name, value: cat.id, slug: cat.slug })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const data = await promptService.getTags();
      setPredefinedTags(data.map(tag => tag.name));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

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

  // Only fetch once on mount
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      await promptService.createPrompt(payload);

      message.success(t('myPrompts.createPrompt.success'));
      form.resetFields();
      setActiveTab('list');
      fetchMyPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
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