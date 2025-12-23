import { EyeOutlined, LikeOutlined, DislikeOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Drawer, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PromptDrawer = ({ open, onClose, prompt }) => {
  const navigate = useNavigate();

  const handleCopy = () => {
    if (prompt?.content) {
      navigator.clipboard.writeText(prompt.content);
    }
  };

  const handleViewDetail = () => {
    // Navigate to detail page
    navigate(`/prompt/${prompt.id}`);
    onClose(); // Close drawer when navigating
  };

  return (
    <Drawer
      title={prompt?.title}
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      className="prompt-drawer"
    >
      {prompt && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="text-gray-600">
            {prompt.fullDescription}
          </div>

          {/* Categories and Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Danh mục & Tags</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md">
                {prompt.category}
              </span>
              {prompt.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <EyeOutlined />
              <span>{prompt.views?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <LikeOutlined className="text-green-600" />
              <span>{prompt.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <DislikeOutlined className="text-red-600" />
              <span>{prompt.dislikes}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả chi tiết</h3>
            <p className="text-gray-600">{prompt.fullDescription}</p>
          </div>

          {/* Prompt Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung Prompt</h3>
            <div className="bg-gray-50 rounded-lg p-4 relative">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {prompt.content}
              </pre>
              <Button
                icon={<CopyOutlined />}
                className="absolute top-2 right-2"
                size="small"
                onClick={handleCopy}
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Author */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tác giả</h3>
            <p className="text-gray-600">{prompt.author}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="primary" 
              icon={<LikeOutlined />}
              className="flex-1"
            >
              Hữu ích
            </Button>
            <Button 
              icon={<DislikeOutlined />}
              className="flex-1"
            >
              Không hữu ích
            </Button>
          </div>
          
          <Button 
            type="primary" 
            icon={<LinkOutlined />}
            className="w-full"
            size="large"
            onClick={handleViewDetail}
          >
            Xem chi tiết
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default PromptDrawer;