import { TagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const TagsSection = () => {
  const { t } = useTranslation();
  
  const tags = [
    'Claude', 'GPT-4', 'Code', 'ChatGPT', 'SEO', 'React',
    'Laravel', 'Marketing', 'Programming', 'Gemini', 'Development', 'Content',
    'PHP', 'Social Media', t('tags.learning'), t('tags.education'), 'Email', t('tags.office'),
    t('tags.professional'), 'Debug', 'Midjourney', t('tags.landscape'), t('tags.art'), 'Facebook',
    t('tags.creative'), t('tags.writing'), t('tags.shortStory'), 'Blog', 'Content Marketing', 'Email Marketing',
    'Conversion', 'AIDA'
  ];

  return (
    <section className="py-4 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TagOutlined className="text-2xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {t('tags.title')}
            </h2>
          </div>
          <p className="text-gray-600">
            {t('tags.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-3">
          {tags.map((tag, index) => (
            <button
              key={index}
              className="text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TagsSection;
