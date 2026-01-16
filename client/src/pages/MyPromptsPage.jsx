import { useState, useEffect } from 'react';
import { Drawer, Form, notification } from 'antd';
import { FileTextOutlined, PlusOutlined, DashboardOutlined, TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
import { PAGINATION } from '../constants/pagination';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';
import DashboardOverview from '../components/DashboardOverview';
import PromptsList from '../components/prompts/PromptsList';
import PromptDrawer from '../components/PromptDrawer';
import ManageCategoriesTags from '../components/ManageCategoriesTags';

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
  const [allPrompts, setAllPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardCurrentPage, setDashboardCurrentPage] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [totalAllPrompts, setTotalAllPrompts] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  
  // Filter and sort states
  const [filters, setFilters] = useState({ category: null, status: null });
  const [sorter, setSorter] = useState({ sortBy: 'created_at', sortOrder: 'desc' });
  const [dashboardFilters, setDashboardFilters] = useState({ category: null, status: null });
  const [dashboardSorter, setDashboardSorter] = useState({ sortBy: 'created_at', sortOrder: 'desc' });

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'create') {
      setActiveTab('create');
      setEditingPrompt(null);
      form.resetFields();
    } else if (tabFromUrl === 'dashboard' && user?.user_type === 'admin') {
      setActiveTab('dashboard');
    } else if (tabFromUrl === 'manage' && user?.user_type === 'admin') {
      setActiveTab('manage');
    } else {
      setActiveTab('list');
    }
  }, [searchParams, form, user?.user_type]);

  useEffect(() => {
    if (user?.id && activeTab === 'list') {
      setCurrentPage(1);
      setInitialLoading(true);
      // Reset filters and sorter to default when switching tabs
      setFilters({ category: null, status: null });
      setSorter({ sortBy: 'created_at', sortOrder: 'desc' });
      fetchMyPrompts(1, '', { category: null, status: null }, { sortBy: 'created_at', sortOrder: 'desc' });
    } else if (user?.user_type === 'admin' && activeTab === 'dashboard') {
      setDashboardCurrentPage(1);
      setInitialLoading(true);
      // Reset filters and sorter to default when switching tabs
      setDashboardFilters({ category: null, status: null });
      setDashboardSorter({ sortBy: 'created_at', sortOrder: 'desc' });
      fetchAllPrompts(1, '', { category: null, status: null }, { sortBy: 'created_at', sortOrder: 'desc' });
    }
  }, [user?.id, user?.user_type, activeTab]);

  const fetchMyPrompts = async (page = currentPage, search = searchValue, filterParams = filters, sortParams = sorter) => {
    try {
      const params = {
        page: page,
        limit: PAGINATION.PAGE_SIZE
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (filterParams.category) {
        params.category = filterParams.category;
      }
      if (filterParams.status) {
        params.status = filterParams.status;
      }
      if (sortParams.sortBy) {
        params.sort_by = sortParams.sortBy;
        params.sort_order = sortParams.sortOrder;
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

  const fetchAllPrompts = async (page = dashboardCurrentPage, search = '', filterParams = dashboardFilters, sortParams = dashboardSorter) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        limit: PAGINATION.PAGE_SIZE
      };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (filterParams.category) {
        params.category = filterParams.category;
      }
      if (filterParams.status) {
        params.status = filterParams.status;
      }
      if (sortParams.sortBy) {
        params.sort_by = sortParams.sortBy;
        params.sort_order = sortParams.sortOrder;
      }
      const response = await promptService.getAllPrompts(params);
      setAllPrompts(response.data || response);
      setTotalAllPrompts(response.pagination?.total || response.length);
    } catch (error) {
      console.error('Error fetching all prompts:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('dashboard.errorFetching', 'Error fetching prompts'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
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
      navigate(ROUTES.MY_PROMPTS);
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
      fetchAllPrompts(dashboardCurrentPage);
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
      fetchAllPrompts(dashboardCurrentPage);
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
    fetchMyPrompts(page, searchValue, filters, sorter);
  };

  const handleTableChange = (tableFilters) => {
    const newPage = tableFilters.page || 1;
    const newFilters = {
      category: tableFilters.category,
      status: tableFilters.status
    };
    const newSorter = {
      sortBy: tableFilters.sortBy || 'created_at',
      sortOrder: tableFilters.sortOrder || 'desc'
    };
    
    setCurrentPage(newPage);
    setFilters(newFilters);
    setSorter(newSorter);
    fetchMyPrompts(newPage, searchValue, newFilters, newSorter);
  };

  const handleDashboardPageChange = (page) => {
    setDashboardCurrentPage(page);
    fetchAllPrompts(page, searchValue, dashboardFilters, dashboardSorter);
  };

  const handleDashboardTableChange = (tableFilters) => {
    const newPage = tableFilters.page || 1;
    const newFilters = {
      category: tableFilters.category,
      status: tableFilters.status
    };
    const newSorter = {
      sortBy: tableFilters.sortBy || 'created_at',
      sortOrder: tableFilters.sortOrder || 'desc'
    };
    
    setDashboardCurrentPage(newPage);
    setDashboardFilters(newFilters);
    setDashboardSorter(newSorter);
    fetchAllPrompts(newPage, searchValue, newFilters, newSorter);
  };

  const handleDashboardSearchSubmit = (value) => {
    setSearchValue(value);
    setDashboardCurrentPage(1);
    fetchAllPrompts(1, value);
  };

  const handleLogout = () => {
    logout(() => setMobileMenuOpen(false));
  };

  const handleSearchSubmit = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
    fetchMyPrompts(1, value);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleViewPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setDrawerOpen(true);
  };

  const menuItems = [
    ...(user?.user_type === 'admin' ? [{
      key: 'dashboard', 
      icon: <DashboardOutlined />, 
      label: t('sidebar.dashboard', 'Dashboard'), 
      action: () => {
        setActiveTab('dashboard');
        setCurrentPage(1);
        setSearchValue('');
        setInitialLoading(true);
        navigate(ROUTES.MY_PROMPTS_DASHBOARD);
      }
    }] : []),
    { 
      key: 'my-prompts', 
      icon: <FileTextOutlined />, 
      label: t('sidebar.myPrompts', 'Prompts của tôi'), 
      action: () => {
        setActiveTab('list');
        setCurrentPage(1);
        setSearchValue('');
        setInitialLoading(true);
        navigate(ROUTES.MY_PROMPTS);
      }
    },
    { 
      key: 'create-prompt', 
      icon: <PlusOutlined />, 
      label: t('myPrompts.createPrompt.title'), 
      action: () => {
        handleCreatePrompt();
        navigate(ROUTES.MY_PROMPTS_CREATE);
      }
    },
    ...(user?.user_type === 'admin' ? [{
      key: 'manage', 
      icon: <TagsOutlined />, 
      label: t('manageCategoriesTags.title', 'Manage Categories & Tags'), 
      action: () => {
        setActiveTab('manage');
        navigate(`${ROUTES.MY_PROMPTS}?tab=manage`);
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
        {activeTab === 'manage' && user?.user_type === 'admin' ? (
          <ManageCategoriesTags onMenuClick={() => setMobileMenuOpen(true)} />
        ) : activeTab === 'dashboard' && user?.user_type === 'admin' ? (
          <DashboardOverview
            prompts={allPrompts}
            loading={initialLoading}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleDashboardSearchSubmit}
            onEditPrompt={handleEditPrompt}
            onDeletePrompt={handleDeletePrompt}
            onSubmitPrompt={handleSubmitForReview}
            onApprovePrompt={handleApprovePrompt}
            onRejectPrompt={handleRejectPrompt}
            currentUser={user}
            onMenuClick={() => setMobileMenuOpen(true)}
            onTableChange={handleDashboardTableChange}
            pagination={{
              current: dashboardCurrentPage,
              total: totalAllPrompts,
              pageSize: PAGINATION.PAGE_SIZE,
            }}
          />
        ) : activeTab === 'list' ? (
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
            onTableChange={handleTableChange}
            pagination={{
              current: currentPage,
              total: totalPrompts,
              pageSize: PAGINATION.PAGE_SIZE,
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
              navigate(ROUTES.MY_PROMPTS);
            }}
            onMenuClick={() => setMobileMenuOpen(true)}
            isEditing={!!editingPrompt}
          />
        )}
      </div>

      <PromptDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prompt={selectedPrompt}
        currentUser={user}
      />
    </div>
  );
};

export default MyPromptsPage;