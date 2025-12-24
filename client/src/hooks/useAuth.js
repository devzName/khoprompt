import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
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
    logout,
    isAuthenticated: !!user
  };
};