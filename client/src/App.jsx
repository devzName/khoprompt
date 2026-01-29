import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PromptDetailPage from './pages/PromptDetailPage';
import SearchPage from './pages/SearchPage';
import MyPromptsPage from './pages/MyPromptsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants/routes';
import { Spin } from 'antd';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();

    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogout);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.SEARCH} element={<SearchPage />} />
      <Route path={ROUTES.PROMPT_DETAIL} element={<PromptDetailPage />} />
      <Route 
        path={ROUTES.MY_PROMPTS} 
        element={
          <ProtectedRoute>
            <MyPromptsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppContent;
