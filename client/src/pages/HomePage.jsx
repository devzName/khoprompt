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
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means "all"
  const [selectedTag, setSelectedTag] = useState(null); // Track selected tag
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const handleCategorySelect = (selection) => {
    if (!selection) {
      setSelectedCategory(null);
      setSelectedTag(null);
    } else if (selection.isTag) {
      setSelectedTag(selection);
      setSelectedCategory({ id: selection.categoryId });
    } else {
      setSelectedCategory(selection);
      setSelectedTag(null);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
    setInitialLoading(true);
  }, [selectedCategory, selectedTag]);
  useEffect(() => {
    const fetchLatestPrompts = async () => {
      try {
        const params = {
          page: currentPage,
          limit: 12
        };
        if (selectedCategory) {
          params.category_id = selectedCategory.id;
        }
        if (selectedTag) {
          params.tag_id = selectedTag.id;
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
  }, [selectedCategory, selectedTag, currentPage]);
  useEffect(() => {
    const fetchFeaturedPrompts = async () => {
      try {
        setLoadingFeatured(true);
        const params = { limit: 6 };
        if (selectedCategory) {
          params.category_id = selectedCategory.id;
        }
        if (selectedTag) {
          params.tag_id = selectedTag.id;
        }
        const response = await promptService.getFeaturedPrompts(params.limit, params.category_id, params.tag_id);
        setFeaturedPrompts(response);
      } catch (error) {
        console.error('Failed to fetch featured prompts:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeaturedPrompts();
  }, [selectedCategory, selectedTag]); // Fetch when category or tag changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories 
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      <FeaturedPrompts prompts={featuredPrompts} loading={loadingFeatured} />
      <LatestPrompts
        prompts={latestPrompts}
        maxItems={null}
        columns={4}
        loading={initialLoading}
        pagination={{
          current: currentPage,
          total: totalPrompts,
          pageSize: 12,
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
