import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin, Empty, notification } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import { bookmarkService } from '../services/bookmarkService';
import { PAGINATION } from '../constants/pagination';

const BookmarkedPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (user) {
      fetchBookmarkedPrompts();
    }
  }, [user, currentPage]);

  const fetchBookmarkedPrompts = async () => {
    try {
      setLoading(true);
      const response = await bookmarkService.getBookmarkedPrompts({
        page: currentPage,
        limit: PAGINATION.PAGE_SIZE
      });
      
      setPrompts(response.data || []);
      setTotalPrompts(response.pagination?.total || 0);
      
      if (response.pagination) {
        setPagination({
          current: response.pagination.page,
          total: response.pagination.total,
          pageSize: response.pagination.limit,
          onChange: handlePageChange,
          showSizeChanger: false,
          showQuickJumper: false,
        });
      } else {
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching bookmarked prompts:', error);
      notification.error({
        message: t('common.error', 'Error'),
        description: t('bookmarked.errorFetching', 'Error fetching bookmarked prompts'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow">
          <Header />
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <BookOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('bookmarked.loginRequired', 'Please login to view bookmarked prompts')}
              </h3>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex justify-center items-center min-h-[60vh] bg-white rounded-lg">
              <div className="text-center p-8">
                <BookOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('bookmarked.empty', 'No bookmarked prompts yet')}
                </h3>
                <p className="text-gray-500 text-sm">
                  {t('bookmarked.emptyDescription', 'Start bookmarking prompts to see them here')}
                </p>
              </div>
            </div>
          ) : (
            <LatestPrompts 
              title={t('bookmarked.title', 'Bookmarked Prompts')}
              description={t('bookmarked.description', 'Your saved prompts for quick access')}
              icon={<BookOutlined className="text-2xl text-blue-500" />}
              prompts={prompts}
              pageSize={12}
              columns={3}
              loading={false}
              showPagination={true}
              pagination={pagination}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookmarkedPage;