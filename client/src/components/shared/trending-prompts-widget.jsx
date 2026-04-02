import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Skeleton, Typography } from 'antd';
import { FireOutlined, EyeOutlined } from '@ant-design/icons';
import { promptService } from '../../services/promptService';
import { ROUTES } from '../../constants/routes';

const { Text } = Typography;

// Rank badge colors: top 3 get vivid colors, rest grey
const RANK_COLORS = ['#f5222d', '#fa8c16', '#fadb14'];

/**
 * Trending prompts widget — fetches GET /prompts/trending?days=7&limit=5
 * Renders a ranked list. Navigates to prompt detail on click.
 * Silently hides on fetch error or empty result.
 */
const TrendingPromptsWidget = ({ days = 7, limit = 5 }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await promptService.getTrendingPrompts(days, limit);
        setPrompts(Array.isArray(data) ? data : (data?.data ?? []));
      } catch {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [days, limit]);

  // Hide silently on error or empty result
  if (!loading && (hasError || prompts.length === 0)) return null;

  return (
    <Card
      size="small"
      className="rounded-2xl shadow-sm"
      title={
        <span className="font-semibold text-base flex items-center gap-2">
          <FireOutlined className="text-orange-500" />
          Đang thịnh hành
        </span>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 1 }} title={false} />
          ))}
        </div>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 list-none m-0 p-0">
          {prompts.map((prompt, index) => {
            const rank = index + 1;
            const rankColor = RANK_COLORS[index] ?? '#8c8c8c';
            return (
              <li key={prompt.id} className="flex items-start gap-2 group">
                {/* Rank badge */}
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ backgroundColor: rankColor }}
                >
                  {rank}
                </span>
                {/* Title + view count */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={ROUTES.PROMPT_DETAIL_PATH(prompt.slug)}
                    className="block text-sm font-medium leading-snug text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                  >
                    {prompt.title}
                  </Link>
                  {prompt.view_count != null && (
                    <Text type="secondary" className="text-xs flex items-center gap-1 mt-0.5">
                      <EyeOutlined />
                      {prompt.view_count.toLocaleString()} lượt xem
                    </Text>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
};

export default TrendingPromptsWidget;
