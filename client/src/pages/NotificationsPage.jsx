// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getNotifications, markAsRead } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        // don't set error for empty state
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, user_status: 'read' } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      // Archive functionality would be implemented here
      console.log('Archiving notification:', notificationId);
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage your notifications</p>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (!notification.user_status || notification.user_status === 'unread')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(!notification.user_status || notification.user_status === 'unread') ? 'Unread' : 'Read'}
                      </span>
                      {notification.is_pinned && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                    <div
                      className="mt-2 text-gray-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.content) }}
                    />
                    <div className="mt-4 text-sm text-gray-500">
                      {formatDate(notification.created_at)}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {(!notification.user_status || notification.user_status === 'unread') && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(notification.id)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;