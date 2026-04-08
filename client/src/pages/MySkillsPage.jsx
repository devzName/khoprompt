/**
 * My Skills page — manage personal skills.
 * Route: /my-skills
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Tag, Space, notification, Modal, Tooltip, Drawer } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { skillService } from '../services/skillService';
import { ROUTES } from '../constants/routes';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/shared/PageHeader';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import dayjs from 'dayjs';

const { confirm } = Modal;

const MySkillsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = useSidebarMenu('my-skills', user, navigate, null, t);

  const fetchMySkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await skillService.getMySkills({ search: search || undefined });
      const skillArray = data.data || data.items || (Array.isArray(data) ? data : []);
      setSkills(skillArray);
    } catch {
      notification.error({ message: t('common.error'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    fetchMySkills();
  }, [fetchMySkills]);

  const handleDelete = (id) => {
    confirm({
      title: t('skills.confirmDeleteSkill', 'Delete this skill?'),
      icon: <ExclamationCircleOutlined />,
      content: t('myPrompts.deleteConfirmContent', 'This action cannot be undone.'),
      okText: t('common.delete', 'Delete'),
      okType: 'danger',
      cancelText: t('common.cancel', 'Cancel'),
      async onOk() {
        try {
          await skillService.deleteSkill(id);
          notification.success({ message: t('skills.deleteSuccess', 'Skill deleted') });
          fetchMySkills();
        } catch {
          notification.error({ message: t('common.error') });
        }
      },
    });
  };

  const columns = [
    {
      title: t('skills.name', 'Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{text}</span>
          <span className="text-xs text-gray-400 line-clamp-1 max-w-xs">{record.description}</span>
        </Space>
      ),
    },
    {
      title: t('skills.category', 'Category'),
      dataIndex: 'category',
      key: 'category',
      render: (cat) => cat ? <Tag color="blue">{cat}</Tag> : '—',
    },
    {
      title: t('myPrompts.table.views', 'Views'),
      dataIndex: 'view_count',
      key: 'views',
      align: 'center',
      render: (v) => <span className="text-gray-500">{v ?? 0}</span>,
    },
    {
      title: t('myPrompts.table.created', 'Created'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <span className="text-gray-400 text-xs">{dayjs(date).format('DD/MM/YYYY')}</span>,
    },
    {
      title: t('common.actions', 'Actions'),
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t('common.view', 'View')}>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(ROUTES.SKILL_DETAIL_PATH(record.id))}
            />
          </Tooltip>
          <Tooltip title={t('common.edit', 'Edit')}>
            <Button 
              type="text" 
              icon={<EditOutlined className="text-blue-500" />} 
              onClick={() => navigate(ROUTES.SKILL_EDIT_PATH(record.id))}
            />
          </Tooltip>
          <Tooltip title={t('common.delete', 'Delete')}>
            <Button 
              type="text" 
              icon={<DeleteOutlined className="text-red-500" />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block border-r border-gray-100 dark:border-white/5">
        <Sidebar menuItems={menuItems} activeTab="my-skills" />
      </div>

      {/* Sidebar Mobile */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={240}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar menuItems={menuItems} activeTab="my-skills" isMobile onClose={() => setMobileMenuOpen(false)} />
      </Drawer>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader
          title={t('skills.mySkills', 'My Skills')}
          description={t('mySkills.subtitle', 'Manage and create your internal tools and capabilities.')}
          breadcrumb={t('skills.mySkills', 'My Skills')}
          onMenuClick={() => setMobileMenuOpen(true)}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTES.SKILL_CREATE)}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 h-9"
          >
            {t('skills.create', 'Create Skill')}
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0d0d0d]">
          <div className="w-full p-4 sm:p-6">
            <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <Input
                  placeholder={t('skills.searchPlaceholder', 'Search skills...')}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  className="max-w-md rounded-lg"
                />
              </div>

              <Table
                columns={columns}
                dataSource={skills || []}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `${t('common.totalItems', { total })}`,
                }}
                className="my-skills-table px-4 pb-4"
                locale={{
                  emptyText: <Empty description={t('skills.empty', 'No skills found')} className="py-12" />,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.my-skills-table .ant-table) {
          background: transparent !important;
        }
        :global(.dark) :global(.my-skills-table .ant-table-thead > tr > th) {
          background: #1a1a1a !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        :global(.dark) :global(.my-skills-table .ant-table-row:hover > td) {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
};

// Simple Fallback Empty
const Empty = ({ description, className }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
      <ToolOutlined className="text-2xl text-gray-300" />
    </div>
    <span className="text-gray-400">{description}</span>
  </div>
);

export default MySkillsPage;
