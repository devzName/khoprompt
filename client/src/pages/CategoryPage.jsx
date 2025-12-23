import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LatestPrompts from '../components/LatestPrompts';
import CategorySidebar from '../components/CategorySidebar';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import { mockPrompts } from '../data/mockPrompts';

const CategoryPage = () => {
  const { t } = useTranslation();
  const { category } = useParams();
  const categoryName = decodeURIComponent(category);
  
  const categoryPrompts = mockPrompts.filter(prompt => 
    prompt.category.toLowerCase() === categoryName.toLowerCase()
  );

  const categoryDescription = t(`categoryPage.categoryDescriptions.${categoryName}`) || t('categoryPage.categoryDescriptions.default');
  const totalItems = categoryPrompts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageHero 
        title={categoryName}
        description={categoryDescription}
        breadcrumb={<><span>{t('categoryPage.home')}</span> / <span className="capitalize">{categoryName}</span></>}
        stats={`${totalItems} ${t('categoryPage.prompts')}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CategorySidebar currentCategory={categoryName} />

          <div className="lg:col-span-3">
            {totalItems === 0 ? (
              <EmptyState 
                title={t('categoryPage.noResults')}
                description={`${t('categoryPage.categoryDescriptions.default')} "${categoryName}" ${t('categoryPage.noResultsDesc')}`}
              />
            ) : (
              <LatestPrompts 
                title={t('categoryPage.results')}
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