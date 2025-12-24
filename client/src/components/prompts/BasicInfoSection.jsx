import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';

const { TextArea } = Input;

const BasicInfoSection = () => {
  const { t } = useTranslation();

  return (
    <PromptFormSection title={t('myPrompts.createPrompt.basicInfo')}>
      <Form.Item
        label={t('myPrompts.createPrompt.titleLabel')}
        name="title"
        rules={[{ required: true, message: t('myPrompts.createPrompt.titleRequired') }]}
        className="mb-4"
      >
        <Input 
          placeholder={t('myPrompts.createPrompt.titlePlaceholder')}
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('myPrompts.createPrompt.descriptionLabel')}
        name="description"
        rules={[{ required: true, message: t('myPrompts.createPrompt.descriptionRequired') }]}
        className="mb-0"
      >
        <TextArea
          placeholder={t('myPrompts.createPrompt.descriptionPlaceholder')}
          rows={3}
          size="large"
        />
      </Form.Item>
    </PromptFormSection>
  );
};

export default BasicInfoSection;