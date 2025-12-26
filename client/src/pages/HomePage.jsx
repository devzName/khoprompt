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

  useEffect(() => {
    const fetchLatestPrompts = async () => {
      try {
        const response = await promptService.getPrompts();
        setLatestPrompts(response);
      } catch (error) {
        console.error('Failed to fetch latest prompts:', error);
      } finally {
        setLoadingLatest(false);
      }
    };

    const fetchFeaturedPrompts = async () => {
      try {
        const response = await promptService.getFeaturedPrompts(6);
        setFeaturedPrompts(response);
      } catch (error) {
        console.error('Failed to fetch featured prompts:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchLatestPrompts();
    fetchFeaturedPrompts();
  }, []);
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <FeaturedPrompts prompts={featuredPrompts} loading={loadingFeatured} />
      <LatestPrompts
        prompts={latestPrompts}
        maxItems={16}
        columns={4}
        loading={loadingLatest}
      />
      <TagsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
