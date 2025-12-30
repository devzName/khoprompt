import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedPrompts from '../components/FeaturedPrompts';
import LatestPrompts from '../components/LatestPrompts';
import TagsSection from '../components/TagsSection';
import Footer from '../components/Footer';
import { promptService } from '../services/promptService';

const HomePage = () => {
  const [latestPrompts, setLatestPrompts] = useState([]);
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means "all"
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Reset to page 1 when category changes
    setCurrentPage(1);
    setInitialLoading(true); // Show loading when category changes
  }, [selectedCategory]);

  useEffect(() => {
    const fetchLatestPrompts = async () => {
      try {
        const params = {
          page: currentPage,
          limit: 9
        };
        if (selectedCategory) {
          params.category_id = selectedCategory.id;
        }
        const response = await promptService.getPrompts(params);
        setLatestPrompts(response.data || response); // Handle both paginated and non-paginated response
        setTotalPrompts(response.pagination?.total || response.length);
      } catch (error) {
        console.error('Failed to fetch latest prompts:', error);
      } finally {
        setInitialLoading(false); // Only turn off loading after first successful fetch
      }
    };

    fetchLatestPrompts();
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    const fetchFeaturedPrompts = async () => {
      try {
        setLoadingFeatured(true);
        const categoryId = selectedCategory ? selectedCategory.id : null;
        const response = await promptService.getFeaturedPrompts(6, categoryId);
        setFeaturedPrompts(response);
      } catch (error) {
        console.error('Failed to fetch featured prompts:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedPrompts();
  }, [selectedCategory]); // Only fetch when category changes, not when page changes

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <FeaturedPrompts prompts={featuredPrompts} loading={loadingFeatured} />
      <LatestPrompts
        prompts={latestPrompts}
        maxItems={null}
        columns={3}
        loading={initialLoading}
        pagination={{
          current: currentPage,
          total: totalPrompts,
          pageSize: 9,
          onChange: handlePageChange,
          showSizeChanger: false,
          showQuickJumper: false,
        }}
      />
      <TagsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
