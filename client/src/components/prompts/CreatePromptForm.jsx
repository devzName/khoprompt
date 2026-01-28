import { Form } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';
import BasicInfoSection from './BasicInfoSection';
import ContentSection from './ContentSection';
import CategorizationSection from './CategorizationSection';
import NotesSection from './NotesSection';
import FormActions from './FormActions';
import { promptCategoriesService } from '../../services/promptCategoriesService';
import { promptTagsService } from '../../services/promptTagsService';
const CreatePromptForm = ({
  form,
  loading,
  onSubmit,
  onCancel,
  onMenuClick,
  isEditing = false
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
          const filtered = mappedTags.filter(tag => tag.categoryId === initialCategory);
          setFilteredTags(filtered);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const handleCategoryChange = (value) => {
    const filtered = allTags.filter(tag => tag.categoryId === value);
    setFilteredTags(filtered);
    form.setFieldsValue({ tags: [] });
  };
  const handleFormSubmit = (values) => {
    const processedValues = {
      ...values,
      category_id: values.category, // Chuyển từ category thành category_id cho API
      tags: values.tags ? values.tags.map(tagId => parseInt(tagId, 10)) : []
    };
    delete processedValues.category;
    onSubmit(processedValues);
  };
  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={isEditing ? t('myPrompts.editPrompt.title', 'Edit Prompt') : t('myPrompts.createPrompt.title')}
        description={isEditing ? t('myPrompts.editPrompt.description', 'Update your prompt details') : t('myPrompts.createPrompt.description')}
        breadcrumb={isEditing ? t('myPrompts.editPrompt.title', 'Edit Prompt') : t('myPrompts.createPrompt.title')}
        onMenuClick={onMenuClick}
      />
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <BasicInfoSection />
            <ContentSection />
            <CategorizationSection 
              categories={categories} 
              predefinedTags={filteredTags}
              onCategoryChange={handleCategoryChange}
            />
            <NotesSection />
            <FormActions loading={loading} onCancel={onCancel} />
          </Form>
        </div>
      </div>
    </div>
  );
};
export default CreatePromptForm;