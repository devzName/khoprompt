/**
 * Empty-state grid shown when a chat room has no messages yet.
 * Shows bookmarked prompts as quick-start cards.
 */
import { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import apiClient from '../../axios/apiClient';
import { API_ENDPOINTS } from '../../constants/api';

const SuggestedPromptCards = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.BOOKMARKS.LIST, { params: { limit: 6 } })
      .then((res) => {
        // Bookmarks response contains prompt objects
        const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        setPrompts(items.slice(0, 6));
      })
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <BulbOutlined className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Chưa có tin nhắn nào. Bắt đầu hội thoại hoặc chọn một prompt gợi ý bên dưới.
      </p>

      {prompts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full">
          {prompts.map((bookmark) => {
            const prompt = bookmark.prompt ?? bookmark;
            return (
              <Card
                key={prompt.id}
                hoverable
                size="small"
                onClick={() => onSelectPrompt?.(prompt)}
                className="text-left cursor-pointer dark:bg-[#1f1f1f] dark:border-gray-700"
              >
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                  {prompt.title}
                </p>
                {prompt.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {prompt.description}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuggestedPromptCards;
