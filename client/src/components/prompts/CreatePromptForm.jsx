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
  const [predefinedTags, setPredefinedTags] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await promptCategoriesService.getCategories();
        setCategories(data.map(cat => ({ label: cat.name, value: cat.id, slug: cat.slug })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const data = await promptTagsService.getTags();
        setPredefinedTags(data.map(tag => ({ label: tag.name, value: tag.id })));
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

  const handleFormSubmit = (values) => {
    onSubmit(values);
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
            <CategorizationSection categories={categories} predefinedTags={predefinedTags} />
            <NotesSection />
            <FormActions loading={loading} onCancel={onCancel} />
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreatePromptForm;