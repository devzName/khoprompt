import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';
import BasicInfoSection from './BasicInfoSection';
import ContentSection from './ContentSection';
import CategorizationSection from './CategorizationSection';
import NotesSection from './NotesSection';
import FormActions from './FormActions';

const CreatePromptForm = ({
  form,
  loading,
  categories,
  predefinedTags,
  onSubmit,
  onCancel,
  onMenuClick,
  isEditing = false
}) => {
  const { t } = useTranslation();

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
          <Form form={form} layout="vertical" onFinish={onSubmit}>
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