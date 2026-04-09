import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Radio, Switch, DatePicker, Tag, notification as antNotification, Popconfirm, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layouts/AdminLayout';
import PageHeader from '../../components/shared/PageHeader';
import NotificationEditor from '../../components/admin/NotificationEditor';
import apiClient from '../../axios/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { createNotification, deleteNotification, getAllNotifications } from '../../services/notificationService';

const AdminNotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const audience = Form.useWatch('target_audience', form);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAllNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      antNotification.error({ message: t('common.error'), placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.LOGIN_SESSIONS.LIST);
      const list = res.data?.users || res.data?.data || [];
      setUsers(list.map(u => ({ label: `${u.full_name || u.email} (${u.email})`, value: u.id })));
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        title: values.title,
        content: values.content,
        target_audience: values.target_audience,
        target_user_ids: values.target_audience === 'specific_users' ? values.target_user_ids : null,
        is_pinned: values.is_pinned || false,
        is_active: true,
        scheduled_at: values.scheduled_at ? values.scheduled_at.toISOString() : null,
        is_public: values.is_public || false,
        show_as_modal: values.show_as_modal || false,
      };
      await createNotification(payload);
      antNotification.success({ message: 'Notification sent', placement: 'topRight' });
      setModalOpen(false);
      form.resetFields();
      fetchNotifications();
    } catch {
      antNotification.error({ message: t('common.error'), placement: 'topRight' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      antNotification.success({ message: 'Deleted', placement: 'topRight' });
      fetchNotifications();
    } catch {
      antNotification.error({ message: t('common.error'), placement: 'topRight' });
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{text}</div>
          <div className="text-xs text-gray-400 truncate max-w-xs">{record.content}</div>
        </div>
      ),
    },
    {
      title: 'Audience',
      dataIndex: 'target_audience',
      key: 'target_audience',
      width: 140,
      render: (val) => (
        <Tag color={val === 'all' ? 'blue' : 'purple'}>
          {val === 'all' ? 'All users' : 'Specific users'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (val) => {
        const colors = { draft: 'default', scheduled: 'processing', published: 'success' };
        return <Tag color={colors[val] || 'default'}>{val || 'published'}</Tag>;
      },
    },
    {
      title: 'Pinned',
      dataIndex: 'is_pinned',
      key: 'is_pinned',
      width: 80,
      render: (val) => val ? <Badge status="warning" text="Yes" /> : <span className="text-gray-400">No</span>,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (val) => val ? <Badge status="success" text="Yes" /> : <Badge status="default" text="No" />,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Popconfirm title="Delete this notification?" onConfirm={() => handleDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <AdminLayout activeTab="notifications">
      {({ onMenuClick }) => (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <PageHeader
            title="Notifications"
            description="Create and manage push notifications for users"
            breadcrumb="Notifications"
            onMenuClick={onMenuClick}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              New Notification
            </Button>
          </PageHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Table
              dataSource={notifications}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              className="bg-white dark:bg-[#141414] rounded-xl"
            />
          </div>
        </div>
      )}

      <Modal
        title="New Notification"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ target_audience: 'all', is_pinned: false }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Notification title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Required' }]}
            getValueFromEvent={(val) => val}
          >
            <NotificationEditor />
          </Form.Item>

          <Form.Item name="target_audience" label="Send to">
            <Radio.Group>
              <Radio value="all">All users</Radio>
              <Radio value="specific_users">Specific users</Radio>
            </Radio.Group>
          </Form.Item>

          {audience === 'specific_users' && (
            <Form.Item name="target_user_ids" label="Select users" rules={[{ required: true, message: 'Select at least one user' }]}>
              <Select
                mode="multiple"
                placeholder="Search and select users..."
                options={users}
                filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                showSearch
              />
            </Form.Item>
          )}

          <Form.Item name="scheduled_at" label="Schedule for">
            <DatePicker showTime placeholder="Leave empty to publish now" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="is_public" label="Public (visible without login)" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item name="show_as_modal" label="Show as popup" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item name="is_pinned" label="Pin notification">
            <Radio.Group>
              <Radio value={false}>No</Radio>
              <Radio value={true}>Yes (show at top)</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SendOutlined />}>
              Send
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
