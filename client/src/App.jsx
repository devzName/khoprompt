import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PromptDetailPage from './pages/PromptDetailPage';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/prompt/:id" element={<PromptDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
