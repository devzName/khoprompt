import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import { promptService } from '../services/promptService';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchPrompts = async () => {
      if (!query.trim()) {
        setPrompts([]);
        return;
      }

      try {
        setLoading(true);
        // Gọi API để search prompts theo title
        const response = await promptService.getPrompts({ search: query });
        setPrompts(response.data || response); // Handle both paginated and non-paginated response
      } catch (error) {
        console.error('Failed to search prompts:', error);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    searchPrompts();
  }, [query]);

  const totalItems = prompts.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : !query.trim() ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Empty
              image={<SearchOutlined className="text-6xl text-gray-300" />}
              description={
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nhập từ khóa tìm kiếm</h3>
                  <p className="text-gray-500">Sử dụng thanh tìm kiếm ở trên để tìm prompts theo tiêu đề</p>
                </div>
              }
            />
          </div>
        ) : totalItems === 0 ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Empty
              image={<SearchOutlined className="text-6xl text-gray-300" />}
              description={
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-gray-500">Không có prompt nào chứa từ khóa "{query}". Thử tìm kiếm với từ khóa khác.</p>
                </div>
              }
            />
          </div>
        ) : (
          <LatestPrompts 
            title="Kết quả tìm kiếm"
            prompts={prompts}
            pageSize={12}
            columns={3}
            loading={loading}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;