import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';

const CategorizationSection = ({ categories, predefinedTags, onCategoryChange }) => {
  const { t } = useTranslation();

  return (
    <PromptFormSection title={t('myPrompts.createPrompt.categorization')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Form.Item
          label={t('myPrompts.createPrompt.categoryLabel')}
          name="category"
          rules={[{ required: true, message: t('myPrompts.createPrompt.categoryRequired') }]}
          className="mb-4 lg:mb-0"
        >
          <Select
            placeholder={t('myPrompts.createPrompt.categoryPlaceholder')}
            size="large"
            options={categories}
            onChange={onCategoryChange}
          />
        </Form.Item>

        <Form.Item
          label={t('myPrompts.createPrompt.tagsLabel')}
          name="tags"
          className="mb-4 lg:mb-0 lg:col-span-2"
        >
          <Select
            mode="multiple"
            placeholder={t('myPrompts.createPrompt.tagsPlaceholder')}
            size="large"
            options={predefinedTags}
            disabled={!predefinedTags || predefinedTags.length === 0}
            maxTagCount="responsive"
          />
        </Form.Item>
      </div>
    </PromptFormSection>
  );
};

export default CategorizationSection;