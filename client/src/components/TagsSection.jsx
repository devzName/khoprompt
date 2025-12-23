import { TagOutlined } from '@ant-design/icons';

const TagsSection = () => {
  const tags = [
    'Claude', 'GPT-4', 'Code', 'ChatGPT', 'SEO', 'React',
    'Laravel', 'Marketing', 'Programming', 'Gemini', 'Development', 'Content',
    'PHP', 'Social Media', 'Học tập', 'Giáo dục', 'Email', 'Văn phòng',
    'Chuyên nghiệp', 'Debug', 'Midjourney', 'Phong cảnh', 'Nghệ thuật', 'Facebook',
    'Sáng tạo', 'Viết lách', 'Truyện ngắn', 'Blog', 'Content Marketing', 'Email Marketing',
    'Conversion', 'AIDA'
  ];

  return (
    <section className="py-4 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TagOutlined className="text-2xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Khám phá theo Tags
            </h2>
          </div>
          <p className="text-gray-600">
            Tìm prompts bằng cách dựa vào các tag yêu thích của bạn
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-3">
          {tags.map((tag, index) => (
            <button
              key={index}
              className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TagsSection;
