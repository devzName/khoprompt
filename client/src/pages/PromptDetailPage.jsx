import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Avatar, Tag, Breadcrumb } from 'antd';
import { 
  CopyOutlined, 
  ShareAltOutlined, 
  EyeOutlined, 
  LikeOutlined, 
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import { mockPrompts } from '../data/mockPrompts';

const PromptDetailPage = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  // Find prompt from mockPrompts based on ID
  const prompt = mockPrompts.find(p => p.id === parseInt(id));

  // If prompt not found, show 404 or redirect
  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-4">Prompt không tồn tại</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Generate default instructions if not provided
  const defaultInstructions = [
    'Copy nội dung prompt ở trên bằng nút "Copy Prompt"',
    'Mở ChatGPT, Claude hoặc AI tool bạn muốn sử dụng',
    'Paste prompt và thay thế các placeholder [brackets] với thông tin cụ thể của bạn',
    'Nhấn Enter để nhận kết quả từ AI'
  ];

  // Use prompt instructions or default ones
  const instructions = prompt.instructions || defaultInstructions;

  // Generate author avatar from first letter of author name
  const authorAvatar = prompt.author ? prompt.author.charAt(0).toUpperCase() : 'A';

  // Format created date (use a default if not provided)
  const createdAt = prompt.createdAt || '01/01/2024';

  // Category descriptions
  const categoryDescriptions = {
    'Development': 'Prompt giúp code, debug và tối ưu code',
    'Design': 'Prompt hỗ trợ thiết kế UI/UX và creative work',
    'Marketing': 'Prompt cho marketing, SEO và content creation',
    'Business Analysis': 'Prompt phân tích business và research',
    'Project Management': 'Prompt quản lý dự án và planning',
    'Testing': 'Prompt cho testing và quality assurance',
    'Data Analysis': 'Prompt phân tích dữ liệu và insights'
  };

  const categoryDescription = categoryDescriptions[prompt.category] || 'Prompt chuyên nghiệp cho nhiều mục đích khác nhau';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>
    },
    {
      title: <Link to={`/category/${prompt.category.toLowerCase()}`}>{prompt.category}</Link>
    },
    {
      title: prompt.title
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content - Full Width */}
        <div className="w-full">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={breadcrumbItems}
          />

          {/* Prompt Header */}
          <div className="mt-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar size={48} className="bg-blue-500 text-white font-semibold">
                {authorAvatar}
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{prompt.title}</h1>
                <p className="text-gray-600 mb-3">{prompt.description}</p>
                
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <EyeOutlined />
                    <span>{prompt.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LikeOutlined />
                    <span>{prompt.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined />
                    <span>{createdAt}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {prompt.tags && prompt.tags.map((tag, index) => (
                    <Tag key={index} color="blue">
                      #{tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="primary" 
                icon={<CopyOutlined />}
                onClick={handleCopyPrompt}
                className="flex-1"
              >
                {copied ? 'Đã copy!' : 'Copy Prompt'}
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                className="px-6"
              >
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Prompt Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nội dung Prompt</h2>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {prompt.content}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hướng dẫn sử dụng</h2>
            <ol className="space-y-2">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-blue-600 font-semibold">{index + 1}.</span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh mục</h2>
            <p className="text-gray-700">
              Prompt này thuộc danh mục <strong>{prompt.category}</strong> - {categoryDescription}
            </p>
          </div>
        </div>

        {/* Related Prompts Section */}
        <div className="mt-16">
          <LatestPrompts 
            title="Prompts cùng danh mục" 
            prompts={mockPrompts}
            currentPrompt={prompt}
            filterByCategory={true}
            maxItems={8}
            columns={4}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PromptDetailPage;