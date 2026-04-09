import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead, archiveNotification } from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // silently fail
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // refresh every 60s
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, user_status: 'read' } : n)
    );
  }, []);

  const archive = useCallback(async (id) => {
    await archiveNotification(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, user_status: 'archived' } : n)
    );
  }, []);

  // user_status is null for broadcast notis with no UserNotification row (treat as unread)
  const unreadCount = notifications.filter(n => !n.user_status || n.user_status === 'unread').length;

  return (
    <NotificationContext.Provider value={{ notifications, loading, unreadCount, fetchNotifications, markRead, archive }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
