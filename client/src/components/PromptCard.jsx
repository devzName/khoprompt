import { Avatar, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Category color map — pastel bg + bold text, used for badge & left stripe
const CATEGORY_COLORS = {
  design:       { bg: 'bg-purple-50 dark:bg-purple-900/20',  text: 'text-purple-700 dark:text-purple-300',  stripe: 'bg-purple-400' },
  development:  { bg: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-700 dark:text-blue-300',      stripe: 'bg-blue-400' },
  testing:      { bg: 'bg-yellow-50 dark:bg-yellow-900/20',  text: 'text-yellow-700 dark:text-yellow-300',  stripe: 'bg-yellow-400' },
  devops:       { bg: 'bg-orange-50 dark:bg-orange-900/20',  text: 'text-orange-700 dark:text-orange-300',  stripe: 'bg-orange-400' },
  security:     { bg: 'bg-red-50 dark:bg-red-900/20',        text: 'text-red-700 dark:text-red-300',        stripe: 'bg-red-400' },
  documentation:{ bg: 'bg-teal-50 dark:bg-teal-900/20',     text: 'text-teal-700 dark:text-teal-300',      stripe: 'bg-teal-400' },
  architecture: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300',  stripe: 'bg-indigo-400' },
  review:       { bg: 'bg-cyan-50 dark:bg-cyan-900/20',      text: 'text-cyan-700 dark:text-cyan-300',      stripe: 'bg-cyan-400' },
  debugging:    { bg: 'bg-rose-50 dark:bg-rose-900/20',      text: 'text-rose-700 dark:text-rose-300',      stripe: 'bg-rose-400' },
  refactoring:  { bg: 'bg-lime-50 dark:bg-lime-900/20',      text: 'text-lime-700 dark:text-lime-300',      stripe: 'bg-lime-400' },
  productivity: { bg: 'bg-green-50 dark:bg-green-900/20',    text: 'text-green-700 dark:text-green-300',    stripe: 'bg-green-400' },
  lifestyle:    { bg: 'bg-pink-50 dark:bg-pink-900/20',      text: 'text-pink-700 dark:text-pink-300',      stripe: 'bg-pink-400' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-100 dark:bg-white/5', text: 'text-gray-600 dark:text-neutral-400', stripe: 'bg-gray-300' };

const getCategoryColor = (name) => {
  if (!name) return DEFAULT_COLOR;
  return CATEGORY_COLORS[name.toLowerCase()] || DEFAULT_COLOR;
};

const CategoryBadge = ({ name, className = '' }) => {
  const color = getCategoryColor(name);
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${color.bg} ${color.text} ${className}`}>
      {name || 'Uncategorized'}
    </span>
  );
};

const PromptCard = ({ prompt, title, description, author, listMode = false, index = 0 }) => {
  const navigate = useNavigate();

  const displayTitle = prompt?.title || title;
  const displayDescription = prompt?.description || description;
  const displayAuthor = prompt?.user?.full_name || prompt?.author || author || 'Unknown';
  const displayAuthorAvatar = prompt?.user?.picture || prompt?.user?.avatar_url;
  const slug = prompt?.slug;
  const isFeatured = prompt?.featured;
  const viewCount = prompt?.view_count ?? 0;
  const likeCount = prompt?.like_count ?? 0;
  const categoryName = typeof prompt?.category === 'object' ? prompt.category?.name : prompt?.category;
  const color = getCategoryColor(categoryName);

  const handleCardClick = () => {
    if (slug) navigate(ROUTES.PROMPT_DETAIL_PATH(slug));
  };

  if (listMode) {
    const isEven = index % 2 === 0;
    return (
      <div
        onClick={handleCardClick}
        className={`flex items-center gap-0 cursor-pointer transition-colors group
          ${isEven ? 'bg-white dark:bg-[#141414]' : 'bg-[#F8FAFC] dark:bg-[#161616]'}
          hover:bg-[#EFF6FF] dark:hover:bg-blue-950/20`}
      >
        {/* Left color stripe */}
        <div className={`w-1 self-stretch shrink-0 ${color.stripe} opacity-70`} />

        <div className="flex items-center gap-4 px-4 py-3.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {isFeatured && <StarOutlined className="text-yellow-500 shrink-0 text-xs" />}
              <span className="font-semibold text-[#1E293B] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {displayTitle}
              </span>
              <CategoryBadge name={categoryName} className="shrink-0" />
            </div>
            <p className="text-sm text-[#64748B] dark:text-neutral-400 truncate">{displayDescription}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs text-[#94A3B8] dark:text-neutral-500">
            <span className={`flex items-center gap-1 ${viewCount > 0 ? 'text-blue-400' : ''}`}>
              <EyeOutlined /> {viewCount}
            </span>
            <span className={`flex items-center gap-1 ${likeCount > 0 ? 'text-rose-400' : ''}`}>
              <LikeOutlined /> {likeCount}
            </span>
            <span className="text-indigo-400 dark:text-indigo-400 font-medium hidden sm:block">
              @{displayAuthor.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid card — same style as homepage LatestPrompts
  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 flex flex-col group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <CategoryBadge name={categoryName} />
        {isFeatured && <StarOutlined className="text-yellow-500 text-sm shrink-0" />}
      </div>

      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug h-12">
        {displayTitle}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 grow leading-relaxed">
        {displayDescription}
      </p>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar size={22} src={displayAuthorAvatar} icon={<UserOutlined />} className="shrink-0" />
          <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
            {displayAuthor}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-400 shrink-0">
          <span className={`flex items-center gap-1 ${viewCount > 0 ? 'text-blue-400' : ''}`}>
            <EyeOutlined /> {viewCount}
          </span>
          <span className={`flex items-center gap-1 ${likeCount > 0 ? 'text-rose-400' : ''}`}>
            <LikeOutlined /> {likeCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export { getCategoryColor, CategoryBadge };
export default PromptCard;
