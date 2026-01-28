import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PromptDetailPage from './pages/PromptDetailPage';
import SearchPage from './pages/SearchPage';
import MyPromptsPage from './pages/MyPromptsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants/routes';
function App() {
  return (
    <Router>
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
    </Router>
  );
}
export default App;
