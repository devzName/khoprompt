import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PromptDetailPage from './pages/PromptDetailPage';
import CategoryPage from './pages/CategoryPage';
import MyPromptsPage from './pages/MyPromptsPage';
import ReviewPromptsPage from './pages/ReviewPromptsPage';
import ManagePromptsPage from './pages/ManagePromptsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants/routes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.CATEGORY} element={<CategoryPage />} />
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
          path={ROUTES.REVIEW_PROMPTS} 
          element={
            <ProtectedRoute>
              <ReviewPromptsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.MANAGE_PROMPTS} 
          element={
            <ProtectedRoute>
              <ManagePromptsPage />
            </ProtectedRoute>
          } 
        />
        {/* Catch all unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
