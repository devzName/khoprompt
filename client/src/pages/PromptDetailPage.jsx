import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Avatar, Tag, Breadcrumb, Spin, notification } from 'antd';
import {
  CopyOutlined,
  EyeOutlined,
  LikeOutlined,
  DislikeOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotFoundPage from './NotFoundPage';
import { ROUTES } from '../constants/routes';
import { promptService } from '../services/promptService';
import { voteService } from '../services/voteService';
import { useViewTracking } from '../hooks/useViewTracking';
import { calculateSimpleRating, formatRating, getRatingContainerColor } from '../utils/ratingUtils';
import dayjs from 'dayjs';
const PromptDetailPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteStats, setVoteStats] = useState({ helpful_count: 0, not_helpful_count: 0 });
  const [currentRating, setCurrentRating] = useState(null);
  const refreshStats = async () => {
    if (prompt?.id) {
      try {
        const updatedStats = await voteService.getPromptVoteStats(prompt.id);
        setVoteStats(updatedStats);
        setPrompt(prev => ({
          ...prev,
          view_count: updatedStats.view_count || 0
        }));
      } catch (error) {
        console.error('Error refreshing stats:', error);
      }
    }
  };
  useViewTracking(
    prompt?.id, 
    prompt?.status === 'approved',
    refreshStats
  );
  useEffect(() => {
    const fetchPromptDetail = async () => {
      try {
        setLoading(true);
        const response = await promptService.getPromptBySlug(slug);
        setPrompt(response);
        if (response.id) {
          try {
            const stats = await voteService.getPromptVoteStats(response.id);
            setVoteStats(stats);
            setCurrentRating(calculateSimpleRating({
              rating: response.rating,
              like_count: stats.helpful_count || 0,
              dislike_count: stats.not_helpful_count || 0
            }));
            setPrompt(prev => ({
              ...prev,
              view_count: stats.view_count || 0
            }));
          } catch (error) {
            console.error('Error fetching vote stats:', error);
          }
          if (user) {
            try {
              const vote = await voteService.getUserVote(response.id);
              setUserVote(vote);
            } catch (error) {
              console.error('Error fetching user vote:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        notification.error({
          title: t('common.error', 'Error'),
          description: t('promptDetail.notFound'),
          placement: 'topRight'
        });
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchPromptDetail();
    }
  }, [slug, t, user]);
  const handleCopyPrompt = () => {
    if (prompt) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = prompt.content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      notification.success({
        title: t('common.success', 'Success'),
        description: t('promptDetail.copied'),
        placement: 'topRight'
      });
    }
  };
  const handleVote = async (isHelpful) => {
    try {
      if (!user) {
        notification.warning({
          title: t('common.warning', 'Warning'),
          description: t('login.required'),
          placement: 'topRight'
        });
        return;
      }
      if (user && prompt && user.id === prompt.user_id) {
        notification.warning({
          title: t('common.warning', 'Warning'),
          description: t('promptDetail.cannotVoteOwn'),
          placement: 'topRight'
        });
        return;
      }
      setVoteLoading(true);
      await voteService.votePrompt(prompt.id, isHelpful);
      setUserVote({ 
        prompt_id: prompt.id,
        is_helpful: isHelpful,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      const updatedStats = await voteService.getPromptVoteStats(prompt.id);
      setVoteStats(updatedStats);
      setCurrentRating(calculateSimpleRating({
        rating: prompt.rating,
        like_count: updatedStats.helpful_count || 0,
        dislike_count: updatedStats.not_helpful_count || 0
      }));
      setPrompt(prev => ({
        ...prev,
        view_count: updatedStats.view_count || 0
      }));
      notification.success({
        title: t('common.success', 'Success'),
        description: isHelpful ? t('promptDetail.votedHelpful') : t('promptDetail.votedNotHelpful'),
        placement: 'topRight'
      });
    } catch (error) {
      console.error('Error voting:', error);
      notification.error({
        title: t('common.error', 'Error'),
        description: error.response?.data?.detail || t('common.error'),
        placement: 'topRight'
      });
    } finally {
      setVoteLoading(false);
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
    return <NotFoundPage />;
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
      title: prompt.category ? (
        typeof prompt.category === 'object' ? prompt.category.name : prompt.category
      ) : 'Uncategorized'
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
              <Avatar 
                size={64} 
                src={prompt.user?.avatar_url || prompt.user?.picture}
                icon={<UserOutlined />} 
                className="bg-linear-to-br from-blue-500 to-purple-600 shadow-lg" 
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{prompt.title}</h1>
                  <Tag color="blue" className="rounded-full px-3 border-blue-100 bg-blue-50 text-blue-600 font-medium">
                    {typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                  </Tag>
                </div>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{prompt.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  {formatRating(currentRating) && (
                    <div className={`flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 ${getRatingContainerColor(currentRating)}`}>
                      <StarOutlined />
                      <span className="font-semibold">
                        {formatRating(currentRating)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <EyeOutlined className="text-blue-500" />
                    <span className="font-semibold text-gray-700">{prompt.view_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <LikeOutlined className="text-green-500" />
                    <span className="font-semibold text-gray-700">{voteStats.helpful_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <DislikeOutlined className="text-red-500" />
                    <span className="font-semibold text-gray-700">{voteStats.not_helpful_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <CalendarOutlined className="text-purple-500" />
                    <span className="font-semibold text-gray-700">{dayjs(prompt.created_at).format('HH:mm DD/MM/YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t('featured.by')}</span>
                    <span className="font-bold text-gray-800">{prompt.user?.full_name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-6 border-t border-gray-100">
              {(!user || user.id !== prompt.user_id) && (
                <>
                  <Button
                    size="large"
                    type={userVote?.is_helpful === true ? "primary" : "default"}
                    icon={<LikeOutlined />}
                    onClick={() => handleVote(true)}
                    loading={voteLoading}
                    className={`flex-1 sm:flex-none h-12 rounded-xl font-semibold ${userVote?.is_helpful === true ? 'bg-green-600 hover:bg-green-700 border-0' : ''}`}
                  >
                    {t('drawer.helpful')}
                  </Button>
                  <Button
                    size="large"
                    type={userVote?.is_helpful === false ? "primary" : "default"}
                    icon={<DislikeOutlined />}
                    onClick={() => handleVote(false)}
                    loading={voteLoading}
                    className={`flex-1 sm:flex-none h-12 rounded-xl font-semibold ${userVote?.is_helpful === false ? 'bg-red-600 hover:bg-red-700 border-0' : ''}`}
                    danger={userVote?.is_helpful === false}
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 pr-12 relative">
                <div 
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: prompt.content || '' }}
                />
                <Button
                  icon={<CopyOutlined />}
                  className="absolute top-2 right-2 bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                  size="small"
                  onClick={handleCopyPrompt}
                >
                  {copied ? t('promptDetail.copied') : t('reviewPromptDrawer.copy')}
                </Button>
              </div>
            </div>
            {prompt.notes && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-purple-500 pl-3">
                  {t('reviewPromptDrawer.notes', 'Ghi chú')}
                </h2>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.notes}
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
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
                {t('promptDetail.categoryDesc')} <span className="font-bold underline underline-offset-4">
                  {typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {prompt.tags?.map((tag, index) => (
                  <Tag
                    key={tag.id || index}
                    className="bg-white/10 border-white/20 text-white rounded-full px-3 py-0.5"
                  >
                    #{typeof tag === 'object' ? tag.name : tag}
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