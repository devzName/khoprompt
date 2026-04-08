import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const CategorizationSection = ({ categories, predefinedTags, onCategoryChange }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Form.Item
        label={t('myPrompts.createPrompt.categoryLabel')}
        name="category"
        rules={[{ required: true, message: t('myPrompts.createPrompt.categoryRequired') }]}
        className="mb-0"
      >
        <Select
          placeholder={t('myPrompts.createPrompt.categoryPlaceholder')}
          size="small"
          options={categories}
          onChange={onCategoryChange}
          style={{ minWidth: 160 }}
        />
      </Form.Item>
      <Form.Item
        label={t('myPrompts.createPrompt.tagsLabel')}
        name="tags"
        className="mb-0"
      >
        <Select
          mode="multiple"
          placeholder={t('myPrompts.createPrompt.tagsPlaceholder')}
          size="small"
          options={predefinedTags}
          disabled={!predefinedTags || predefinedTags.length === 0}
          maxTagCount="responsive"
          style={{ flex: 1, minWidth: 200 }}
        />
      </Form.Item>
    </div>
  );
};

export default CategorizationSection;
