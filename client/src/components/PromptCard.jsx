import { Card, Avatar } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
const PromptCard = ({ title, description, author }) => {
  return (
    <Card
      hoverable
      className="h-full border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden bg-white dark:bg-[#141414]"
    >
      <div className="flex flex-col h-full min-h-[150px]">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-words">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow leading-relaxed break-words">
          {description}
        </p>
        <div className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 min-w-0 flex-shrink">
            <Avatar
              size="small"
              icon={<UserOutlined />}
              className="bg-linear-to-br from-blue-500 to-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium truncate">@{author}</span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex-shrink-0 whitespace-nowrap">
            <EyeOutlined className="text-sm sm:text-base" />
            <span>Xem nhanh</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
export default PromptCard;
