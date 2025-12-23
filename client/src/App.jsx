import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PromptDetailPage from './pages/PromptDetailPage';
import CategoryPage from './pages/CategoryPage';
import MyPromptsPage from './pages/MyPromptsPage';
import { ROUTES } from './constants/routes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.CATEGORY} element={<CategoryPage />} />
        <Route path={ROUTES.PROMPT_DETAIL} element={<PromptDetailPage />} />
        <Route path={ROUTES.MY_PROMPTS} element={<MyPromptsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
