import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Avatar, Tag, Breadcrumb } from 'antd';
import { 
  CopyOutlined, 
  ShareAltOutlined, 
  EyeOutlined, 
  LikeOutlined, 
  CalendarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import { mockPrompts } from '../data/mockPrompts';
import { ROUTES } from '../constants/routes';

const PromptDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const prompt = mockPrompts.find(p => p.id === parseInt(id));

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-4">{t('promptDetail.notFound')}</p>
          <Link to={ROUTES.HOME} className="text-blue-600 hover:text-blue-800">
            {t('promptDetail.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const getDefaultInstructions = () => {
    return [
      t('promptDetail.defaultInstructions.0'),
      t('promptDetail.defaultInstructions.1'),
      t('promptDetail.defaultInstructions.2'),
      t('promptDetail.defaultInstructions.3')
    ];
  };

  const instructions = prompt.instructions || getDefaultInstructions();
  const authorAvatar = prompt.author ? prompt.author.charAt(0).toUpperCase() : 'A';
  const createdAt = prompt.createdAt || '01/01/2024';
  const categoryDescription = t(`categoryPage.categoryDescriptions.${prompt.category}`) || t('categoryPage.categoryDescriptions.default');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const breadcrumbItems = [
    {
      title: <Link to={ROUTES.HOME}>{t('promptDetail.home')}</Link>
    },
    {
      title: <Link to={ROUTES.CATEGORY_PATH(prompt.category.toLowerCase())}>{prompt.category}</Link>
    },
    {
      title: prompt.title
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar size={48} className="bg-blue-500 text-white font-semibold">
                {authorAvatar}
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{prompt.title}</h1>
                <p className="text-gray-600 mb-3">{prompt.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <EyeOutlined />
                    <span>{prompt.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LikeOutlined />
                    <span>{prompt.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined />
                    <span>{createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {prompt.tags && prompt.tags.map((tag, index) => (
                    <Tag key={index} color="blue">
                      #{tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="primary" 
                icon={<CopyOutlined />}
                onClick={handleCopyPrompt}
                className="flex-1"
              >
                {copied ? t('promptDetail.copied') : t('promptDetail.copyPrompt')}
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                className="px-6"
              >
                {t('promptDetail.share')}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('promptDetail.promptContent')}</h2>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {prompt.content}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('promptDetail.instructions')}</h2>
            <ol className="space-y-2">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-blue-600 font-semibold">{index + 1}.</span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('promptDetail.category')}</h2>
            <p className="text-gray-700">
              {t('promptDetail.categoryDesc')} <strong>{prompt.category}</strong> - {categoryDescription}
            </p>
          </div>
        </div>

        <div className="mt-16">
          <LatestPrompts 
            title={t('promptDetail.relatedPrompts')} 
            prompts={mockPrompts}
            currentPrompt={prompt}
            filterByCategory={true}
            maxItems={8}
            columns={4}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PromptDetailPage;