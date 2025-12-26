import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await authService.getCurrentUser();
        const user = {
          ...userInfo,
          name: userInfo.full_name || userInfo.email.split('@')[0],
          picture: userInfo.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = (closeMobileMenu) => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setUser(null);
    navigate(ROUTES.HOME);
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };
};