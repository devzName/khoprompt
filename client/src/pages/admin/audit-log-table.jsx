import { Table, Tag, Tooltip } from 'antd';

// Action badge color map
const ACTION_COLOR = {
  login_success: 'green',
  login_failed: 'red',
  logout: 'blue',
  password_change: 'orange',
};

const ACTION_LABEL = {
  login_success: 'Login',
  login_failed: 'Failed Login',
  logout: 'Logout',
  password_change: 'Pwd Change',
};

const fmt = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
const formatTs = (ts) => (ts ? fmt.format(new Date(ts)) : '—');

// Trim user-agent to browser/OS hint only
const shortUa = (ua) => {
  if (!ua) return '—';
  if (ua.length <= 40) return ua;
  return ua.slice(0, 40) + '…';
};

/**
 * Server-side paginated audit log table.
 *
 * Props:
 *   data         – { items, total, page, limit }
 *   loading      – bool
 *   pagination   – Ant Design pagination config
 *   onChange     – Table onChange handler (pagination, filters, sorter)
 *   onRowClick   – (record) => void  — opens UserActivityDrawer
 */
const AuditLogTable = ({ data, loading, pagination, onChange, onRowClick }) => {
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, r) => r.email || <span className="text-gray-400 text-xs">anonymous</span>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={ACTION_COLOR[action] ?? 'default'}>
          {ACTION_LABEL[action] ?? action}
        </Tag>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip) => ip || '—',
    },
    {
      title: 'Device / Browser',
      dataIndex: 'user_agent',
      key: 'user_agent',
      render: (ua) => (
        <Tooltip title={ua || '—'}>
          <span className="text-xs text-gray-500 dark:text-gray-400">{shortUa(ua)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (ts) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTs(ts)}</span>,
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data?.items ?? []}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      onRow={(record) => ({
        onClick: () => record.user_id && onRowClick?.(record),
        onKeyDown: (e) => e.key === 'Enter' && record.user_id && onRowClick?.(record),
        tabIndex: record.user_id ? 0 : undefined,
        role: record.user_id ? 'button' : undefined,
        style: record.user_id ? { cursor: 'pointer' } : {},
        'aria-label': record.user_id ? `Xem hoạt động của ${record.email || 'người dùng'}` : undefined,
      })}
      size="small"
      scroll={{ x: 700 }}
    />
  );
};

export default AuditLogTable;
