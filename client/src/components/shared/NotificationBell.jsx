import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Badge, Popover, List, Typography, Button, Space, Empty, Spin } from 'antd';
import { useNotifications } from '../../hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationBell = () => {
    const { notifications, unreadCount, loading, markAsRead, markAllRead, fetchNotifications } = useNotifications();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircleOutlined className="text-green-500" />;
            case 'error': return <CloseCircleOutlined className="text-red-500" />;
            default: return <InfoCircleOutlined className="text-blue-500" />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const notificationList = (
        <div className="w-80 sm:w-96 max-h-[500px] flex flex-col">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <Text strong className="text-lg">{t('notifications.title')}</Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={markAllRead} className="p-0">
                        {t('notifications.markAllRead')}
                    </Button>
                )}
            </div>
            <div className="overflow-y-auto flex-1">
                {loading && notifications.length === 0 ? (
                    <div className="p-10 text-center"><Spin /></div>
                ) : notifications.length === 0 ? (
                    <Empty description={t('notifications.empty')} className="my-10" />
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!item.is_read ? 'bg-blue-50/30' : ''}`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <List.Item.Meta
                                    avatar={getIcon(item.type)}
                                    title={
                                        <div className="flex justify-between items-center">
                                            <Text strong={!item.is_read}>{item.title}</Text>
                                            <Text type="secondary" className="text-[10px]">
                                                {dayjs(item.created_at).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <Text type={item.is_read ? "secondary" : "default"} className="text-xs line-clamp-2">
                                            {item.message}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );

    return (
        <Popover
            content={notificationList}
            trigger="click"
            placement="bottomRight"
            overlayClassName="notification-popover"
            styles={{ body: { padding: 0 } }}
            onOpenChange={(open) => open && fetchNotifications()}
        >
            <div className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                <Badge count={unreadCount} size="small" offset={[0, 0]}>
                    <BellOutlined className="text-xl text-gray-600" />
                </Badge>
            </div>
        </Popover>
    );
};

export default NotificationBell;
