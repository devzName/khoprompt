import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import { searchService } from '../services/searchService';
import { PAGINATION } from '../constants/pagination';
const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const isTagSearch = searchParams.get('type') === 'tag';
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [pagination, setPagination] = useState(null);
  
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
        if (currentPage === 1) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }
        const response = await searchService.searchPrompts({ 
          q: isTagSearch ? undefined : query,
          tag: isTagSearch ? query : undefined,
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
          <div className="flex justify-center items-center min-h-[60vh] bg-white rounded-lg">
            <div className="text-center p-8">
              <SearchOutlined style={{ fontSize: '4rem', color: '#d1d5db', display: 'block', margin: '0 auto 1rem' }} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('search.enterKeyword')}</h3>
              <p className="text-gray-500 text-sm">{t('search.enterKeywordDesc')}</p>
            </div>
          </div>
        ) : query.trim() && (totalPrompts === 0 || prompts.length === 0) ? (
          <div className="flex justify-center items-center min-h-[60vh] bg-white rounded-lg">
            <div className="text-center p-8">
              <SearchOutlined style={{ fontSize: '4rem', color: '#d1d5db', display: 'block', margin: '0 auto 1rem' }} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('search.noResults')}</h3>
              <p className="text-gray-500 text-sm">
                {t('search.noResultsDesc', { query })}
              </p>
            </div>
          </div>
        ) : query.trim() && prompts.length > 0 ? (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10 rounded-lg backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                  <Spin size="default" />
                  <span className="text-gray-600">{t('search.loadingPage', { page: currentPage })}</span>
                </div>
              </div>
            )}
            <div className={loading ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
              <LatestPrompts 
                title={isTagSearch ? t('search.tagResults', { query }) : t('search.searchResults', { query })}
                prompts={prompts}
                pageSize={12}
                columns={3}
                loading={false}
                showPagination={true}
                pagination={pagination}
              />
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
};
export default SearchPage;