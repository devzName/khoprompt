import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useAuth } from './useAuth';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(10);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const data = await notificationService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            message.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 60000);

        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Use current protocol (http -> ws, https -> wss)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/v1/notifications/ws?token=${token}`;

        let ws = new WebSocket(wsUrl);
        let reconnectTimer = null;

        const connect = () => {
            ws.onopen = () => {
                console.log('Notification WebSocket connected');
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const messageData = JSON.parse(event.data);
                    if (messageData.type === 'new_notification') {
                        const newNoti = messageData.data;
                        setNotifications(prev => [newNoti, ...prev.slice(0, 9)]);
                        setUnreadCount(prev => prev + 1);
                        message.info(newNoti.title || 'New notification');
                    }
                } catch (err) {
                    console.error('Error parsing WS message:', err);
                }
            };

            ws.onclose = () => {
                console.log('Notification WebSocket disconnected, retrying in 5s...');
                reconnectTimer = setTimeout(() => {
                    ws = new WebSocket(wsUrl);
                    connect();
                }, 5000);
            };

            ws.onerror = (err) => {
                console.error('Notification WebSocket error:', err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, [user, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllRead
    };
};
