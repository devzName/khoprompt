/**
 * Step 1 of skill form wizard: Basic Info (name, description, category, tags).
 */
import { Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  'Development', 'Testing', 'DevOps', 'Documentation', 'Security',
  'Architecture', 'Review', 'Debugging', 'Refactoring', 'Other',
];

const SkillFormStepBasic = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Form.Item
        name="name"
        label={t('skills.form.name', 'Name')}
        rules={[{ required: true, message: t('skills.form.nameRequired', 'Name is required') }]}
      >
        <Input placeholder={t('skills.form.namePlaceholder', 'e.g. Code Reviewer')} maxLength={100} />
      </Form.Item>

      <Form.Item
        name="description"
        label={t('skills.form.description', 'Description')}
        rules={[{ required: true, message: t('skills.form.descriptionRequired', 'Description is required') }]}
      >
        <TextArea
          rows={4}
          placeholder={t('skills.form.descriptionPlaceholder', 'Describe what this skill does...')}
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="category"
        label={t('skills.form.category', 'Category')}
      >
        <Select
          placeholder={t('skills.form.categoryPlaceholder', 'Select or type a category')}
          mode="combobox"
          options={CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))}
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="tags"
        label={t('skills.form.tags', 'Tags')}
      >
        <Select
          mode="tags"
          placeholder={t('skills.form.tagsPlaceholder', 'Add tags (press Enter)')}
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="is_public"
        label={t('skills.form.visibility', 'Visibility')}
        initialValue={false}
      >
        <Select options={[
          { value: false, label: t('skills.form.private', 'Private') },
          { value: true, label: t('skills.form.public', 'Public') },
        ]} />
      </Form.Item>
    </div>
  );
};

export default SkillFormStepBasic;
