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

  useEffect(() => {
    const fetchLatestPrompts = async () => {
      try {
        setLoadingLatest(true);
        const params = {};
        if (selectedCategory) {
          params.category_id = selectedCategory.id;
        }
        const response = await promptService.getPrompts(params);
        setLatestPrompts(response);
      } catch (error) {
        console.error('Failed to fetch latest prompts:', error);
      } finally {
        setLoadingLatest(false);
      }
    };

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

    fetchLatestPrompts();
    fetchFeaturedPrompts();
  }, [selectedCategory]);
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
        maxItems={16}
        columns={3}
        loading={loadingLatest}
      />
      <TagsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
