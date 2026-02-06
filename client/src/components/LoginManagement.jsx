import { Table, Card, Input, Button, Space, Modal, Tooltip } from 'antd';
import { UserSwitchOutlined, SearchOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import PageHeader from './shared/PageHeader';
import { loginSessionService } from '../services/loginSessionService';
import { notification } from 'antd';
import { PAGINATION } from '../constants/pagination';

const LoginManagement = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const searchInput = useRef(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sort_by: 'login_time',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.PAGE_SIZE,
    total: 0
  });

  useEffect(() => {
    fetchSessions();
  }, [pagination.current, filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await loginSessionService.getLoginSessions({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      });
      
      setSessions(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching login sessions:', error);
      notification.error({
        message: t('common.error', 'Lỗi'),
        description: t('loginManagement.fetchError', 'Không thể tải danh sách phiên đăng nhập')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (userId, userName, isActive) => {
    Modal.confirm({
      title: isActive ? t('loginManagement.confirmLock', 'Xác nhận khóa tài khoản') : t('loginManagement.confirmUnlock', 'Xác nhận mở khóa tài khoản'),
      content: isActive 
        ? t('loginManagement.confirmLockDesc', `Bạn có chắc muốn khóa tài khoản của ${userName}?`, { userName })
        : t('loginManagement.confirmUnlockDesc', `Bạn có chắc muốn mở khóa tài khoản của ${userName}?`, { userName }),
      okText: t('common.confirm', 'Xác nhận'),
      cancelText: t('common.cancel', 'Hủy'),
      okType: isActive ? 'danger' : 'primary',
      onOk: async () => {
        try {
          await loginSessionService.toggleUserStatus(userId);
          notification.success({
            message: t('common.success', 'Thành công'),
            description: isActive 
              ? t('loginManagement.lockSuccess', 'Đã khóa tài khoản thành công')
              : t('loginManagement.unlockSuccess', 'Đã mở khóa tài khoản thành công')
          });
          fetchSessions();
        } catch (error) {
          console.error('Error toggling user status:', error);
          notification.error({
            message: t('common.error', 'Lỗi'),
            description: t('loginManagement.toggleError', 'Không thể thay đổi trạng thái tài khoản')
          });
        }
      }
    });
  };

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
    setFilters(prev => ({ ...prev, search: selectedKeys[0] || '' }));
    setPagination(prev => ({ ...prev, current: PAGINATION.DEFAULT_PAGE }));
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setFilters(prev => ({ ...prev, search: '' }));
    setPagination(prev => ({ ...prev, current: PAGINATION.DEFAULT_PAGE }));
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={t('common.search', 'Tìm kiếm')}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {t('common.search', 'Tìm kiếm')}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            {t('common.reset', 'Đặt lại')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filters.search ? '#1890ff' : undefined }} />
    ),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      }
    }
  });

  const columns = [
    {
      title: t('loginManagement.userName', 'Tên người dùng'),
      dataIndex: 'user_name',
      key: 'user_name',
      width: 200,
      ...getColumnSearchProps('user_name'),
    },
    {
      title: t('loginManagement.email', 'Email'),
      dataIndex: 'user_email',
      key: 'user_email',
      width: 250,
      ...getColumnSearchProps('user_email'),
    },
    {
      title: t('loginManagement.loginTime', 'Thời gian đăng nhập'),
      dataIndex: 'login_time',
      key: 'login_time',
      width: 180,
      sorter: true,
      render: (time) => dayjs(time).format('DD/MM/YYYY HH:mm')
    },
    {
      title: t('loginManagement.lastActivity', 'Hoạt động cuối'),
      dataIndex: 'last_activity',
      key: 'last_activity',
      width: 180,
      sorter: true,
      render: (time) => dayjs(time).format('DD/MM/YYYY HH:mm')
    },
    {
      title: t('loginManagement.status', 'Trạng thái'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: t('loginManagement.active', 'Hoạt động'), value: 'active' },
        { text: t('loginManagement.inactive', 'Đã khóa'), value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const isActive = status === 'active';
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isActive ? t('loginManagement.active', 'Hoạt động') : t('loginManagement.inactive', 'Đã khóa')}
          </span>
        );
      }
    },
    {
      title: t('common.actions', 'Thao tác'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        // Don't show action for admin users
        if (record.user_type === 'admin') {
          return null;
        }
        
        return (
          <Space size="small">
            <Tooltip title={record.status === 'active' ? t('loginManagement.lockAccount', 'Khóa tài khoản') : t('loginManagement.unlockAccount', 'Mở khóa tài khoản')}>
              <Button
                type="link"
                danger={record.status === 'active'}
                size="small"
                icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => handleToggleStatus(record.id, record.user_name, record.status === 'active')}
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  const handleTableChange = (paginationConfig, filters, sorter) => {
    // Handle pagination
    if (paginationConfig.current !== pagination.current) {
      setPagination(prev => ({ ...prev, current: paginationConfig.current }));
    }

    // Handle sorting
    if (sorter.order) {
      const sortFieldMap = {
        'login_time': 'login_time',
        'last_activity': 'last_activity'
      };
      const sortBy = sortFieldMap[sorter.field] || 'login_time';
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      
      setFilters(prev => ({
        ...prev,
        sort_by: sortBy,
        sort_order: sortOrder
      }));
    } else {
      // Reset to default sort
      setFilters(prev => ({
        ...prev,
        sort_by: 'login_time',
        sort_order: 'desc'
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('sidebar.loginManagement', 'Quản lý đăng nhập')}
        description={t('loginManagement.description', 'Quản lý phiên đăng nhập và quyền truy cập của người dùng')}
        breadcrumb={t('sidebar.loginManagement', 'Quản lý đăng nhập')}
        onMenuClick={onMenuClick}
      />

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          <Card className="shadow-sm">
            <Table
              columns={columns}
              dataSource={sessions}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1400 }}
              onChange={handleTableChange}
              pagination={{
                ...pagination,
                showSizeChanger: false,
                showTotal: (total) => t('common.totalItems', { total }, `Tổng ${total} phiên`)
              }}
              className="login-sessions-table"
              rowClassName="hover:bg-gray-50 transition-colors"
              locale={{
                emptyText: (
                  <div className="py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UserSwitchOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                      <div className="text-lg font-medium text-gray-600 mb-2">
                        {t('loginManagement.noSessions', 'Không có phiên đăng nhập')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('loginManagement.noSessionsDescription', 'Chưa có phiên đăng nhập nào được ghi nhận')}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginManagement;
