// src/components/UserDropdown.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markAsRead } from '../services/notificationService';
import { formatDate } from '../utils/dateUtils';

const UserDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      
      // user_status is null for broadcast notis with no UserNotification row (treat as unread)
      const unread = data.filter(n => !n.user_status || n.user_status === 'unread').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, user_status: 'read' } : n
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700 font-medium">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <Link 
          to="/notifications" 
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-between"
          onClick={onClose}
        >
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold leading-5 bg-red-100 text-red-800">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link 
          to="/profile" 
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          Profile
        </Link>
        <Link 
          to="/settings" 
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          Settings
        </Link>
      </div>

      <div className="border-t border-gray-200 p-2">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md text-left"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;