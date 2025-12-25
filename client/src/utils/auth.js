import { authService } from '../services/authService';

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < (currentTime + 300);
  } catch (error) {
    return true;
  }
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  if (!token || !user || isTokenExpired(token)) {
    authService.logout();
    return false;
  }
  
  return true;
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};