/**
 * Step 2 of skill form wizard: Spec editor (steps, tools, constraints).
 * Dynamic lists with add/remove buttons.
 */
import { Button, Input, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

/**
 * Reusable dynamic string list editor.
 * @param {{ label: string, items: string[], onChange: (items: string[]) => void, required?: boolean, placeholder?: string }} props
 */
const DynamicList = ({ label, items, onChange, required, placeholder }) => {
  const { t } = useTranslation();

  const handleChange = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => onChange([...items, '']);

  const handleRemove = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Text className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Text>
        <Button size="small" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('skills.form.add', 'Add')}
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-sm text-gray-400 dark:text-neutral-500 py-2">
          {t('skills.form.noItems', 'No items yet. Click Add to create one.')}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={placeholder || `${label} ${index + 1}`}
            className="flex-1"
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(index)}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * @param {{ steps: string[], tools: string[], constraints: string[], onChange: (field: string, value: string[]) => void }} props
 */
const SkillFormStepSpec = ({ steps, tools, constraints, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <DynamicList
        label={t('skills.form.steps', 'Steps')}
        items={steps}
        onChange={(val) => onChange('steps', val)}
        required
        placeholder={t('skills.form.stepPlaceholder', 'Describe a step...')}
      />
      <DynamicList
        label={t('skills.form.tools', 'Tools')}
        items={tools}
        onChange={(val) => onChange('tools', val)}
        placeholder={t('skills.form.toolPlaceholder', 'e.g. Bash, Read, Write')}
      />
      <DynamicList
        label={t('skills.form.constraints', 'Constraints')}
        items={constraints}
        onChange={(val) => onChange('constraints', val)}
        placeholder={t('skills.form.constraintPlaceholder', 'e.g. Never modify production data')}
      />
    </div>
  );
};

export default SkillFormStepSpec;
