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
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLoginManagementPage from './pages/admin/AdminLoginManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import PlaygroundPage from './pages/PlaygroundPage';
import CreatePromptPage from './pages/CreatePromptPage';
import SkillListPage from './pages/SkillListPage';
import PromptListPage from './pages/PromptListPage';
import MySkillsPage from './pages/MySkillsPage';
import SkillCreatePage from './pages/SkillCreatePage';
import SkillDetailPage from './pages/SkillDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header';
import { ROUTES } from './constants/routes';
import { Spin, ConfigProvider, theme } from 'antd';
import { useDarkMode } from './hooks/use-dark-mode';

/**
 * Shared layout: sticky header at top; content fills remaining height.
 * Each page controls its own overflow/scroll behaviour.
 */
const AuthLayout = ({ children }) => (
  <div className="flex flex-col h-screen">
    <Header />
    <div className="flex-1 min-h-0 overflow-y-auto">
      {children}
    </div>
  </div>
);

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
    <AuthLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.PROMPTS} element={<PromptListPage />} />
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
          path={ROUTES.MY_PROMPTS_CREATE}
          element={
            <ProtectedRoute>
              <CreatePromptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-prompts/:id/edit"
          element={
            <ProtectedRoute>
              <CreatePromptPage />
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
            <AdminRoute>
              <AdminPromptManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_AUDIT_LOGS}
          element={
            <AdminRoute>
              <AuditLogPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CATEGORIES}
          element={
            <AdminRoute>
              <AdminCategoriesPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_LOGIN_MANAGEMENT}
          element={
            <AdminRoute>
              <AdminLoginManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.PLAYGROUND}
          element={
            <ProtectedRoute>
              <PlaygroundPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playground/:roomId"
          element={
            <ProtectedRoute>
              <PlaygroundPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SKILLS}
          element={<ProtectedRoute><SkillListPage /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.MY_SKILLS}
          element={<ProtectedRoute><MySkillsPage /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.SKILL_CREATE}
          element={<ProtectedRoute><SkillCreatePage /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.SKILL_DETAIL}
          element={<ProtectedRoute><SkillDetailPage /></ProtectedRoute>}
        />
        <Route
          path={ROUTES.SKILL_EDIT}
          element={<ProtectedRoute><SkillCreatePage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthLayout>
  );
}

export default App;
