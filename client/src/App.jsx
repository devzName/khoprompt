import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PromptDetailPage from './pages/PromptDetailPage';
import SearchPage from './pages/SearchPage';
import MyPromptsPage from './pages/MyPromptsPage';
import BookmarkedPage from './pages/BookmarkedPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPromptManagementPage from './pages/admin/AdminPromptManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants/routes';
import { Spin, ConfigProvider, theme } from 'antd';
import { useDarkMode } from './hooks/use-dark-mode';

function App() {
  const [isDark] = useDarkMode();
  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <AppContent />
    </ConfigProvider>
  );
}

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
      <Route 
        path={ROUTES.BOOKMARKED} 
        element={
          <ProtectedRoute>
            <BookmarkedPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path={ROUTES.ADMIN_PROMPTS}
        element={
          <ProtectedRoute>
            <AdminPromptManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
