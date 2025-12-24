import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4">
          <Icon className="text-3xl sm:text-4xl text-gray-400" />
        </div>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">{description}</p>
        {actionText && onAction && (
          <Button
            type="default"
            size="large"
            icon={<PlusOutlined />}
            onClick={onAction}
            className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 hover:border-amber-400 w-full sm:w-auto"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;