import { Card, Avatar } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';

const PromptCard = ({ title, description, author }) => {
  return (
    <Card
      hoverable
      className="h-full border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden"
    >
      <div className="flex flex-col h-full min-h-[150px]">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors break-words">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 flex-grow leading-relaxed break-words">
          {description}
        </p>
        <div className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-gray-100">
          <div className="flex items-center space-x-2 min-w-0 flex-shrink">
            <Avatar
              size="small"
              icon={<UserOutlined />}
              className="bg-linear-to-br from-blue-500 to-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">@{author}</span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0 whitespace-nowrap">
            <EyeOutlined className="text-sm sm:text-base" />
            <span>Xem nhanh</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PromptCard;
