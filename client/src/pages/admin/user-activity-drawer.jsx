import { useEffect, useState } from 'react';
import { Drawer, Timeline, Tag, Spin, Empty, Typography } from 'antd';
import {
  LoginOutlined,
  LogoutOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';

const { Text } = Typography;

// Maps action string to { color, icon, label }
const ACTION_META = {
  login_success: { color: 'green', icon: <LoginOutlined />, label: 'Login' },
  login_failed: { color: 'red', icon: <WarningOutlined />, label: 'Failed Login' },
  logout: { color: 'blue', icon: <LogoutOutlined />, label: 'Logout' },
  password_change: { color: 'orange', icon: null, label: 'Password Change' },
};

const formatTs = (ts) =>
  ts ? new Date(ts).toLocaleString() : '—';

/**
 * Slide-in drawer showing a user's recent authentication activity (last 90 days).
 *
 * Props:
 *   userId   – UUID string | null  (null = closed)
 *   onClose  – () => void
 */
const UserActivityDrawer = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }
    setLoading(true);
    adminService
      .getUserActivity(userId)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const user = data?.user;
  const activity = data?.activity ?? [];

  const timelineItems = activity.map((entry) => {
    const meta = ACTION_META[entry.action] ?? { color: 'gray', icon: null, label: entry.action };
    return {
      color: meta.color,
      dot: meta.icon || undefined,
      children: (
        <div key={entry.id}>
          <Tag color={meta.color}>{meta.label}</Tag>
          <Text type="secondary" className="text-xs ml-2">{formatTs(entry.created_at)}</Text>
          {entry.ip_address && (
            <div className="text-xs text-gray-400 mt-0.5">IP: {entry.ip_address}</div>
          )}
        </div>
      ),
    };
  });

  return (
    <Drawer
      title={user ? `Activity — ${user.full_name || user.email}` : 'User Activity'}
      placement="right"
      width={420}
      open={!!userId}
      onClose={onClose}
      destroyOnHidden
    >
      {loading && (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      )}
      {!loading && activity.length === 0 && (
        <Empty description="No activity in the last 90 days" />
      )}
      {!loading && activity.length > 0 && (
        <Timeline items={timelineItems} />
      )}
    </Drawer>
  );
};

export default UserActivityDrawer;
