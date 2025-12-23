import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import CategorySidebar from '../components/CategorySidebar';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import { mockPrompts } from '../data/mockPrompts';

const CategoryPage = () => {
  const { category } = useParams();
  const categoryName = decodeURIComponent(category);
  
  const categoryPrompts = mockPrompts.filter(prompt => 
    prompt.category.toLowerCase() === categoryName.toLowerCase()
  );

  const categoryDescriptions = {
    'Development': 'Prompt giúp code, debug và tối ưu code',
    'Design': 'Prompt hỗ trợ thiết kế UI/UX và creative work',
    'Marketing': 'Prompt cho marketing, SEO và content creation',
    'Business Analysis': 'Prompt phân tích business và research',
    'Project Management': 'Prompt quản lý dự án và planning',
    'Testing': 'Prompt cho testing và quality assurance',
    'Data Analysis': 'Prompt phân tích dữ liệu và insights'
  };

  const categoryDescription = categoryDescriptions[categoryName] || 'Prompt chuyên nghiệp cho nhiều mục đích khác nhau';
  const totalItems = categoryPrompts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageHero 
        title={categoryName}
        description={categoryDescription}
        breadcrumb={<><span>Trang chủ</span> / <span className="capitalize">{categoryName}</span></>}
        stats={`${totalItems} Prompts`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CategorySidebar currentCategory={categoryName} />

          <div className="lg:col-span-3">
            {totalItems === 0 ? (
              <EmptyState 
                title="Không tìm thấy prompt nào"
                description={`Danh mục "${categoryName}" hiện chưa có prompt nào.`}
              />
            ) : (
              <LatestPrompts 
                title="Kết quả"
                prompts={categoryPrompts}
                pageSize={9}
                columns={3}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;