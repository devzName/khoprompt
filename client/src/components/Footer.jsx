import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';

const Footer = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await promptService.getTopCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch footer categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <a href="/" className="inline-flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Prompt Library Logo" className="w-8 h-8 object-contain shrink-0" />
              <span className="text-lg font-bold whitespace-nowrap">Prompt Library</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              {t('footer.description')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('footer.copyright')}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">{t('footer.popularCategories')}</h3>
            <ul className="space-y-1.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={ROUTES.CATEGORY_PATH(cat.slug)} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {cat.name} <span className="text-gray-600">({cat.prompt_count})</span>
                  </Link>
                </li>
              ))}
              <li>
                {/* Fallback or View All if needed. For now just category list */}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">{t('footer.support')}</h3>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {t('footer.guide')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {t('footer.reportBug')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-500 text-xs">
              {t('footer.builtWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
