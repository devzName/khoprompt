import { Form } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BasicInfoSection from './BasicInfoSection';
import ContentSection from './ContentSection';
import ImageUploadSection from './ImageUploadSection';
import CategorizationSection from './CategorizationSection';
import FormActions from './FormActions';
import DetailsAccordion from './details-accordion';
import { promptCategoriesService } from '../../services/promptCategoriesService';
import { promptTagsService } from '../../services/promptTagsService';

const CreatePromptForm = ({
  form,
  loading,
  onSubmit,
  onCancel,
  onMenuClick,
  isEditing = false,
  initialData = null
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
          promptTagsService.getTags()
        ]);
        setCategories(categoriesData.map(cat => ({
          label: cat.name,
          value: cat.id,
          slug: cat.slug
        })));
        const mappedTags = tagsData.map(tag => ({
          label: tag.name,
          value: tag.id.toString(),
          categoryId: tag.category_id
        }));
        setAllTags(mappedTags);
        const initialCategory = form.getFieldValue('category');
        if (initialCategory) {
          setFilteredTags(mappedTags.filter(tag => tag.categoryId === initialCategory));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (value) => {
    setFilteredTags(allTags.filter(tag => tag.categoryId === value));
    form.setFieldsValue({ tags: [] });
  };

  const handleFormSubmit = (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('content', values.content);
    formData.append('content_format', values.content_format || 'html');
    formData.append('category_id', values.category);
    if (values.notes) formData.append('notes', values.notes);
    formData.append(
      'tags',
      JSON.stringify(values.tags?.length ? values.tags.map(tag => parseInt(tag, 10)) : [])
    );
    if (values.images?.length) {
      values.images.forEach(file => formData.append('images', file));
    }
    if (values.existingImages?.length) {
      formData.append('existingImages', JSON.stringify(values.existingImages));
    }
    onSubmit(formData);
  };

  // Watch title for sticky header display
  const title = Form.useWatch('title', form);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Sticky top action bar */}
      <FormActions
        loading={loading}
        onCancel={onCancel}
        onSubmit={() => form.submit()}
        isEditing={isEditing}
        title={title}
      />

      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            {/* Top meta bar: Category + Tags */}
            <CategorizationSection
              categories={categories}
              predefinedTags={filteredTags}
              onCategoryChange={handleCategoryChange}
            />

            <div className="border-b border-gray-100 dark:border-gray-800 my-6" />

            {/* Title + Description */}
            <BasicInfoSection />

            <div className="border-b border-gray-100 dark:border-gray-800 my-6" />

            {/* Content editor */}
            <ContentSection />

            {/* Collapsible Details: Notes + Images */}
            <DetailsAccordion existingImages={initialData?.images || []} />
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreatePromptForm;
