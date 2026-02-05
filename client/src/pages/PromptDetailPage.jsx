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
  StarOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotFoundPage from './NotFoundPage';
import { ROUTES } from '../constants/routes';
import { promptService } from '../services/promptService';
import { voteService } from '../services/voteService';
import { bookmarkService } from '../services/bookmarkService';
import { useViewTracking } from '../hooks/useViewTracking';
import { formatRating, getRatingContainerColor } from '../utils/ratingUtils';
import dayjs from 'dayjs';

// Get server URL for images
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

// Image Gallery Detail Component
const ImageGalleryDetail = ({ images, title, serverUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index) => {
    setCurrentIndex(index);
  };

  const handleMainImageClick = () => {
    window.open(`${serverUrl}/${images[currentIndex]}`, '_blank');
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-[4/3] border border-gray-200">
        <img
          src={`${serverUrl}/${images[currentIndex]}`}
          alt={`${title} - Hình ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={handleMainImageClick}
        />
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1.5 rounded-full font-medium">
          {currentIndex + 1}/{images.length}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-black rounded-full p-3 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-black rounded-full p-3 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative bg-gray-50 rounded-lg overflow-hidden aspect-[4/3] border-2 cursor-pointer transition-all ${
                index === currentIndex 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleImageClick(index)}
            >
              <img
                src={`${serverUrl}/${image}`}
                alt={`${title} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-opacity-20"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            setCurrentRating(response.simple_rating || stats.simple_rating);
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

            try {
              const bookmarked = await bookmarkService.isBookmarked(response.id);
              setIsBookmarked(bookmarked);
            } catch (error) {
              console.error('Error checking bookmark status:', error);
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
  }, [slug, user]);
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

      // Prevent spam clicking - check if user already voted with the same value
      if (userVote && userVote.is_helpful === isHelpful) {
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
      // Update rating from server response if available
      const updatedStats = await voteService.getPromptVoteStats(prompt.id);
      setVoteStats(updatedStats);
      // Keep existing rating or use updated stats if available
      if (updatedStats.simple_rating) {
        setCurrentRating(updatedStats.simple_rating);
      }
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

  const handleBookmark = async () => {
    try {
      if (!user) {
        notification.warning({
          title: t('common.warning', 'Warning'),
          description: t('login.required'),
          placement: 'topRight'
        });
        return;
      }

      setBookmarkLoading(true);
      const result = await bookmarkService.toggleBookmark(prompt.id);
      setIsBookmarked(result.is_bookmarked);
      
      notification.success({
        title: t('common.success', 'Success'),
        description: result.is_bookmarked 
          ? t('promptDetail.bookmarkAdded', 'Prompt bookmarked successfully')
          : t('promptDetail.bookmarkRemoved', 'Bookmark removed successfully'),
        placement: 'topRight'
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      notification.error({
        title: t('common.error', 'Error'),
        description: error.response?.data?.detail || t('common.error'),
        placement: 'topRight'
      });
    } finally {
      setBookmarkLoading(false);
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
        <Link to={`${ROUTES.SEARCH}?q=${encodeURIComponent(typeof prompt.category === 'object' ? prompt.category.name : prompt.category)}&type=category`}>
          {typeof prompt.category === 'object' ? prompt.category.name : prompt.category}
        </Link>
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
                
                <div className="mt-4 pt-4">
                  <div className="flex flex-wrap gap-3 items-start">
                    <div className="flex items-center gap-2">
                      <Tag color="blue" className="rounded-lg px-3 py-1 border-blue-200 bg-blue-50 text-blue-700 font-medium text-sm">
                        {typeof prompt.category === 'object' ? prompt.category?.name : (prompt.category || 'Uncategorized')}
                      </Tag>
                    </div>
                    
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex flex-wrap gap-2">
                          {prompt.tags.map((tag, index) => (
                            <Tag
                              key={tag.id || index}
                              className="bg-gray-50 border-gray-200 text-gray-600 rounded-lg px-3 py-1 font-medium text-sm hover:bg-gray-100 transition-colors"
                            >
                              #{typeof tag === 'object' ? tag.name : tag}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-6 border-t border-gray-100">
              <div className="flex gap-4 flex-1">
                {(!user || user.id !== prompt.user_id) && (
                  <>
                    <Button
                      size="large"
                      type={userVote?.is_helpful === true ? "primary" : "default"}
                      icon={<LikeOutlined />}
                      onClick={() => handleVote(true)}
                      loading={voteLoading}
                      disabled={userVote?.is_helpful === true}
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
                      disabled={userVote?.is_helpful === false}
                      className={`flex-1 sm:flex-none h-12 rounded-xl font-semibold ${userVote?.is_helpful === false ? 'bg-red-600 hover:bg-red-700 border-0' : ''}`}
                      danger={userVote?.is_helpful === false}
                    >
                      {t('drawer.notHelpful')}
                    </Button>
                  </>
                )}
                
                {user && (
                  <Button
                    size="large"
                    type={isBookmarked ? "primary" : "default"}
                    icon={<BookOutlined />}
                    onClick={handleBookmark}
                    loading={bookmarkLoading}
                    className={`flex-1 sm:flex-none h-12 rounded-xl font-semibold ${isBookmarked ? 'bg-blue-600 hover:bg-blue-700 border-0' : ''}`}
                  >
                    {isBookmarked ? t('promptDetail.bookmarked') : t('promptDetail.bookmark')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {t('promptDetail.promptContent')}
              </h2>
              <div className="rounded-lg p-4 relative border border-gray-300" style={{ backgroundColor: '#f5f5f5' }}>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {t('reviewPromptDrawer.notes', 'Ghi chú')}
                </h2>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.notes}
                </div>
              </div>
            )}

          </div>
          <div className="lg:col-span-2 space-y-8">
            {/* Images Section */}
            {prompt.images && prompt.images.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {t('promptDetail.images', 'Hình ảnh')}
                </h3>
                <ImageGalleryDetail 
                  images={prompt.images}
                  title={prompt.title}
                  serverUrl={SERVER_URL}
                />
              </div>
            )}

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

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default PromptDetailPage;