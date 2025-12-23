import Header from '../components/Header';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedPrompts from '../components/FeaturedPrompts';
import LatestPrompts from '../components/LatestPrompts';
import TagsSection from '../components/TagsSection';
import Footer from '../components/Footer';
import { mockPrompts } from '../data/mockPrompts';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <FeaturedPrompts />
      <LatestPrompts 
        prompts={mockPrompts} 
        maxItems={8}
        columns={4}
      />
      <TagsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
