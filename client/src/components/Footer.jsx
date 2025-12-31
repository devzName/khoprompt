import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GithubOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo và mô tả */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Prompt Library Logo" className="w-10 h-10 object-contain shrink-0" />
              <span className="text-xl font-bold whitespace-nowrap">Prompt Library</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">{t('footer.connectWithUs')}:</span>
              <div className="flex gap-3">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <TwitterOutlined className="text-lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <LinkedinOutlined className="text-lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <GithubOutlined className="text-lg" />
                </a>
              </div>
            </div>
          </div>

          {/* Thống kê nhanh */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">{t('footer.statistics')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t('footer.approvedPrompts')}</span>
                <span className="text-white font-semibold">1,200+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t('footer.positiveRatings')}</span>
                <span className="text-white font-semibold">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t('footer.categories')}</span>
                <span className="text-white font-semibold">8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Đường kẻ và thông tin cuối */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              {t('footer.copyright')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('footer.developedBy')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
