import { useState } from 'react';
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

  const predefinedTags = [
    'Viết lách', 'Marketing', 'Giáo dục', 'Kinh doanh', 'Sáng tạo', 'Phân tích', 'Lập trình',
    'Thiết kế', 'Nghiên cứu', 'Tư vấn', 'Dịch thuật', 'Tóm tắt', 'Brainstorming', 'SEO',
    'Social Media', 'Email', 'Presentation', 'Copywriting', 'Content', 'Strategy', 'Planning',
    'Review', 'Feedback', 'Training', 'Coaching', 'Consulting', 'Analysis', 'Report'
  ];

  const categories = [
    { label: t('categoryPage.categoryDescriptions.Development'), value: 'development' },
    { label: t('categoryPage.categoryDescriptions.Marketing'), value: 'marketing' },
    { label: t('categoryPage.categoryDescriptions.Design'), value: 'design' },
    { label: t('categoryPage.categoryDescriptions.Business Analysis'), value: 'business' },
    { label: t('categoryPage.categoryDescriptions.Project Management'), value: 'project' },
    { label: t('categoryPage.categoryDescriptions.Data Analysis'), value: 'data' },
  ];

  const menuItems = [
    { key: 'my-prompts', icon: <FileTextOutlined />, label: t('sidebar.myPrompts'), action: () => setActiveTab('list') },
    { key: 'create-prompt', icon: <PlusOutlined />, label: t('myPrompts.createPrompt.title'), action: () => setActiveTab('create') },
  ];

  const handleCreatePrompt = () => {
    setActiveTab('create');
  };

  const handleSubmitPrompt = async (values) => {
    try {
      setLoading(true);
      console.log('Creating prompt:', values);
      
      message.success(t('myPrompts.createPrompt.success'));
      form.resetFields();
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating prompt:', error);
      message.error(t('myPrompts.createPrompt.error'));
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

  return {
    // State
    user,
    searchValue,
    mobileMenuOpen,
    activeTab,
    form,
    loading,
    predefinedTags,
    categories,
    menuItems,
    
    // Actions
    setMobileMenuOpen,
    setActiveTab,
    handleCreatePrompt,
    handleSubmitPrompt,
    handleLogout,
    handleSearchChange,
  };
};