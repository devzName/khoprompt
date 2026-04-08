import { Tag, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const PromptCard = ({ prompt, title, description, author, listMode = false }) => {
  const navigate = useNavigate();

  const displayTitle = prompt?.title || title;
  const displayDescription = prompt?.description || description;
  const displayAuthor = prompt?.user?.full_name || prompt?.author || author || 'Unknown';
  const slug = prompt?.slug;
  const isFeatured = prompt?.featured;
  const viewCount = prompt?.view_count ?? 0;
  const likeCount = prompt?.like_count ?? 0;
  const categoryName = typeof prompt?.category === 'object' ? prompt.category?.name : prompt?.category;

  const handleCardClick = () => {
    if (slug) navigate(ROUTES.PROMPT_DETAIL_PATH(slug));
  };

  if (listMode) {
    return (
      <div
        onClick={handleCardClick}
        className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-[#141414] hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isFeatured && <StarOutlined className="text-yellow-500 shrink-0" />}
            <span className="font-semibold text-gray-900 dark:text-white truncate">{displayTitle}</span>
            <Tag className="m-0 border-none bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 shrink-0">
              {categoryName || 'Uncategorized'}
            </Tag>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 truncate">{displayDescription}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-neutral-500 shrink-0">
          <span className="flex items-center gap-1"><EyeOutlined /> {viewCount}</span>
          <span className="flex items-center gap-1"><LikeOutlined /> {likeCount}</span>
          <span className="hidden sm:block">@{displayAuthor.split(' ')[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

      <div className="relative flex flex-col h-full gap-4">
        <div className="flex items-start justify-between gap-2">
          <Tag className="m-0 border-none bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5">
            {categoryName || 'Uncategorized'}
          </Tag>
          {isFeatured && (
            <Tooltip title="Featured">
              <StarOutlined className="text-yellow-500 shrink-0" />
            </Tooltip>
          )}
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {displayTitle}
        </h3>

        <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {displayDescription}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><EyeOutlined className="text-blue-500/70" /> {viewCount}</span>
            <span className="flex items-center gap-1"><LikeOutlined className="text-pink-500/70" /> {likeCount}</span>
          </div>
          <span className="font-medium text-gray-400/80">@{displayAuthor.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
