/**
 * 2-column prompt creation/editing form.
 * LEFT  (fixed width, scrollable): Categorization + Basic info + optional Details accordion
 * RIGHT (flex, scrollable):        Content editor (HTML or Markdown)
 *
 * Parent must provide <Form> wrapper and pass onFormFinish for submission handling.
 */
import { Form } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BasicInfoSection from './BasicInfoSection';
import ContentSection from './ContentSection';
import CategorizationSection from './CategorizationSection';
import FormActions from './FormActions';
import DetailsAccordion from './details-accordion';
import { promptCategoriesService } from '../../services/promptCategoriesService';
import { promptTagsService } from '../../services/promptTagsService';

const CreatePromptForm = ({
  form,
  loading,
  onCancel,
  onMenuClick,
  onFormFinish,
  isEditing = false,
  initialData = null,
}) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          promptCategoriesService.getCategories(),
          promptTagsService.getTags(),
        ]);
        setCategories(categoriesData.map((cat) => ({ label: cat.name, value: cat.id, slug: cat.slug })));
        const mappedTags = tagsData.map((tag) => ({
          label: tag.name,
          value: tag.id.toString(),
          categoryId: tag.category_id,
        }));
        setAllTags(mappedTags);
        const initialCategory = form.getFieldValue('category');
        if (initialCategory) {
          setFilteredTags(mappedTags.filter((tag) => tag.categoryId === initialCategory));
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (value) => {
    setFilteredTags(allTags.filter((tag) => tag.categoryId === value));
    form.setFieldsValue({ tags: [] });
  };

  // Watch title for display in the sticky action bar
  const title = Form.useWatch('title', form);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sticky action bar */}
      <FormActions
        loading={loading}
        onCancel={onCancel}
        onSubmit={() => form.submit()}
        isEditing={isEditing}
        title={title}
        onMenuClick={onMenuClick}
      />

      {/* 2-column form body */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFormFinish}
        className="flex-1 flex min-h-0 overflow-hidden"
        style={{ display: 'flex' }}
      >
        {/* LEFT — meta fields, scrollable */}
        <div className="w-[400px] xl:w-[440px] flex-shrink-0 overflow-y-auto border-r border-gray-100 dark:border-white/[0.06] px-6 py-5 space-y-5 bg-white dark:bg-[#111]">

          <section>
            <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              {t('myPrompts.createPrompt.categoryLabel', 'Categorization')}
            </p>
            <CategorizationSection
              categories={categories}
              predefinedTags={filteredTags}
              onCategoryChange={handleCategoryChange}
            />
          </section>

          <div className="border-t border-gray-100 dark:border-white/[0.06]" />

          <section>
            <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              {t('myPrompts.createPrompt.basicInfo', 'Basic Information')}
            </p>
            <BasicInfoSection />
          </section>

          {/* Optional fields — collapsible */}
          <DetailsAccordion existingImages={initialData?.images || []} />
        </div>

        {/* RIGHT — content editor, scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50 dark:bg-[#0d0d0d]">
          <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            {t('myPrompts.createPrompt.contentLabel', 'Prompt Content')}
          </p>
          <ContentSection />
        </div>
      </Form>
    </div>
  );
};

export default CreatePromptForm;
