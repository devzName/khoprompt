/**
 * Single chat message bubble — role-based styling for user/assistant/system.
 * Uses remarkGfm for full GitHub Flavored Markdown (tables, strikethrough, etc).
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const roleConfig = {
  user: {
    align: 'justify-end',
    bubble: 'bg-blue-500 text-white rounded-br-none',
    label: null,
  },
  assistant: {
    align: 'justify-start',
    bubble: 'bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none',
    label: '🤖 AI',
  },
  system: {
    align: 'justify-start',
    bubble: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 rounded-bl-none',
    label: '⚙️ System',
  },
};

const ChatMessageItem = ({ message }) => {
  const config = roleConfig[message.role] ?? roleConfig.assistant;

  return (
    <div className={`flex ${config.align} px-4 py-1`}>
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${config.bubble}`}>
        {config.label && (
          <div className="text-xs font-semibold mb-1 opacity-60">{config.label}</div>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none break-words
          prose-table:text-xs prose-td:px-2 prose-td:py-1 prose-th:px-2 prose-th:py-1
          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:rounded prose-pre:text-xs
          prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
