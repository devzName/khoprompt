import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import { promptService } from '../services/promptService';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Loading cho lần đầu search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [pagination, setPagination] = useState(null);

  // Unified effect để xử lý cả query changes và page changes
  useEffect(() => {
    const searchPrompts = async () => {
      if (!query.trim()) {
        setPrompts([]);
        setTotalPrompts(0);
        setPagination(null);
        setInitialLoading(false);
        return;
      }

      try {
        // Sử dụng initialLoading cho lần đầu search, loading cho pagination
        if (currentPage === 1) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }
        
        const response = await promptService.getPrompts({ 
          search: query, 
          page: currentPage, 
          limit: 12 
        });
        
        setPrompts(response.data || response);
        setTotalPrompts(response.pagination?.total || response.length);
        
        // Tạo pagination object cho LatestPrompts
        if (response.pagination) {
          setPagination({
            current: response.pagination.current_page,
            total: response.pagination.total,
            pageSize: response.pagination.per_page,
            onChange: handlePageChange,
            showSizeChanger: false,
            showQuickJumper: false,
          });
        } else {
          setPagination(null);
        }
      } catch (error) {
        console.error('Failed to search prompts:', error);
        setPrompts([]);
        setTotalPrompts(0);
        setPagination(null);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    searchPrompts();
  }, [query, currentPage]);

  // Reset về trang 1 khi query thay đổi (chỉ khi cần thiết)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [query]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {initialLoading ? (
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
        ) : totalPrompts === 0 ? (
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
          <div className="relative">
            {/* Loading overlay cho pagination */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10 rounded-lg backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                  <Spin size="default" />
                  <span className="text-gray-600">Đang tải trang {currentPage}...</span>
                </div>
              </div>
            )}
            
            <div className={loading ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
              <LatestPrompts 
                title={`Kết quả tìm kiếm cho "${query}"`}
                prompts={prompts}
                pageSize={12}
                columns={3}
                loading={false} // Không truyền loading vào LatestPrompts để tránh duplicate loading
                showPagination={true}
                pagination={pagination}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;