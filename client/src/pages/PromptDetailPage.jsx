import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Avatar, Tag, Breadcrumb, Spin, message } from 'antd';
import {
  CopyOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ROUTES } from '../constants/routes';
import { API_ENDPOINTS } from '../constants/api';
import dayjs from 'dayjs';
import apiClient from '../axios/apiClient';

const PromptDetailPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHelpful, setIsHelpful] = useState(null);

  useEffect(() => {
    const fetchPromptDetail = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BY_ID(id));
        setPrompt(response.data);

        apiClient.post(API_ENDPOINTS.PROMPTS.VIEW(id)).catch(() => { });
      } catch (error) {
        console.error('Error fetching prompt:', error);
        message.error(t('promptDetail.notFound'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPromptDetail();
    }
  }, [id, t]);

  // Validated view tracking with read time and scroll depth
  useEffect(() => {
    if (!prompt) return;

    // Don't track views for own prompts or non-approved prompts
    const isOwnPrompt = user && prompt.owner_id === user.id;
    const isApproved = prompt.state === 'APPROVED';

    if (isOwnPrompt || !isApproved) {
      return;
    }

    let startTime = Date.now();
    let maxScroll = 0;
    let viewSent = false;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const percent = total > 0 ? Math.round((scrolled / total) * 100) : 0;
      maxScroll = Math.max(maxScroll, percent);
    };

    window.addEventListener('scroll', handleScroll);

    // Send validated view after minimum engagement
    const timer = setTimeout(async () => {
      if (viewSent) return;

      const readTime = Math.floor((Date.now() - startTime) / 1000);

      // Only send if user engaged sufficiently
      if (readTime >= 0.1 && maxScroll >= 10) {
        viewSent = true;
        try {
          const response = await apiClient.post(API_ENDPOINTS.PROMPTS.VIEW(id), null, {
            params: { read_time: readTime, scroll_depth: maxScroll }
          });

          // If view was counted, update the UI immediately
          if (response.data.counted) {
            setPrompt(prev => ({
              ...prev,
              views: (prev.views || 0) + 1
            }));
          }
        } catch (error) {
          console.error('Failed to record view:', error);
        }
      }
    }, 5000); // Wait 5 seconds before checking

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prompt, id, user]);

  const handleCopyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      message.success(t('promptDetail.copied'));
    }
  };

  const handleVote = async (value) => {
    try {
      if (!user) {
        message.warning(t('login.required'));
        return;
      }

      if (user && prompt && user.id === prompt.owner_id) {
        message.warning(t('promptDetail.cannotVoteOwn'));
        return;
      }

      const endpoint = value === 1 ? API_ENDPOINTS.PROMPTS.LIKE(id) : API_ENDPOINTS.PROMPTS.DISLIKE(id);
      const response = await apiClient.post(endpoint);

      setIsHelpful(value === 1);
      setPrompt(response.data);
      message.success(t('common.success'));
    } catch (error) {
      message.error(error.response?.data?.detail || t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">{t('promptDetail.notFound')}</p>
            <Link to={ROUTES.HOME} className="text-blue-600 hover:text-blue-800 font-medium">
              {t('promptDetail.backHome')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const instructions = [
    t('promptDetail.defaultInstructions.0'),
    t('promptDetail.defaultInstructions.1'),
    t('promptDetail.defaultInstructions.2'),
    t('promptDetail.defaultInstructions.3')
  ];

  const breadcrumbItems = [
    { title: <Link to={ROUTES.HOME}>{t('promptDetail.home')}</Link> },
    {
      title: prompt.categoryInfo ? (
        <Link to={ROUTES.CATEGORY_PATH(prompt.categoryInfo.slug)}>{prompt.categoryInfo.name}</Link>
      ) : prompt.category
    },
    { title: prompt.title }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <div className="mt-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-8 overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              <Avatar size={64} icon={<UserOutlined />} className="bg-linear-to-br from-blue-500 to-purple-600 shadow-lg" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{prompt.title}</h1>
                  <Tag color="blue" className="rounded-full px-3 border-blue-100 bg-blue-50 text-blue-600 font-medium">
                    {prompt.categoryInfo?.name || prompt.category}
                  </Tag>
                </div>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-3xl">{prompt.description}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <EyeOutlined className="text-blue-500" />
                    <span className="font-semibold text-gray-700">{prompt.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <LikeOutlined className="text-green-500" />
                    <span className="font-semibold text-gray-700">{prompt.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <CalendarOutlined className="text-purple-500" />
                    <span className="font-semibold text-gray-700">{dayjs(prompt.created_at).format('DD/MM/YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t('featured.by')}</span>
                    <span className="font-bold text-gray-800">{prompt.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-6 border-t border-gray-100">
              <Button
                size="large"
                icon={<CopyOutlined />}
                onClick={handleCopyPrompt}
                className="flex-1 sm:flex-none h-12 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                {copied ? t('promptDetail.copied') : t('promptDetail.copy')}
              </Button>

              {/* Only show vote buttons if not own prompt */}
              {(!user || user.id !== prompt.owner_id) && (
                <>
                  <Button
                    size="large"
                    type={isHelpful === true ? "primary" : "default"}
                    icon={<LikeOutlined />}
                    onClick={() => handleVote(1)}
                    className={`flex-1 sm:flex-none h-12 rounded-xl font-semibold ${isHelpful === true ? 'bg-green-600 hover:bg-green-700 border-0' : ''}`}
                  >
                    {t('drawer.helpful')}
                  </Button>
                  <Button
                    size="large"
                    type={isHelpful === false ? "primary" : "default"}
                    icon={<DislikeOutlined />}
                    onClick={() => handleVote(-1)}
                    className={`flex-1 sm:flex-none h-12 rounded-xl font-semibold ${isHelpful === false ? 'bg-red-600 hover:bg-red-700 border-0' : ''}`}
                    danger={isHelpful === false}
                  >
                    {t('drawer.notHelpful')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                {t('promptDetail.promptContent')}
              </h2>
              <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm text-gray-100 whitespace-pre-wrap leading-relaxed shadow-inner border border-gray-800">
                {prompt.content}
              </div>
            </div>

            {prompt.full_description && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                  {t('drawer.detailDescription')}
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                  {prompt.full_description}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('promptDetail.instructions')}</h2>
              <ol className="space-y-4">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 py-1 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-linear-to-br from-blue-600 to-purple-700 rounded-2xl p-6 sm:p-8 shadow-lg text-white">
              <h2 className="text-xl font-bold mb-4">{t('promptDetail.category')}</h2>
              <p className="text-blue-50 mb-6 leading-relaxed opacity-90">
                {t('promptDetail.categoryDesc')} <span className="font-bold underline underline-offset-4">{prompt.categoryInfo?.name || prompt.category}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {prompt.tagsInfo?.map((tag) => (
                  <Tag
                    key={tag.id}
                    className="bg-white/10 border-white/20 text-white rounded-full px-3 py-0.5"
                  >
                    #{tag.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PromptDetailPage;