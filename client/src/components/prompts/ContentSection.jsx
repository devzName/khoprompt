import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';

const { TextArea } = Input;

const ContentSection = () => {
  const { t } = useTranslation();

  return (
    <PromptFormSection title={t('myPrompts.createPrompt.content')}>
      <Form.Item
        label={t('myPrompts.createPrompt.contentLabel')}
        name="content"
        rules={[{ required: true, message: t('myPrompts.createPrompt.contentRequired') }]}
        className="mb-0"
      >
        <TextArea
          placeholder={t('myPrompts.createPrompt.contentPlaceholder')}
          rows={8}
          size="large"
          className="font-mono"
        />
      </Form.Item>
    </PromptFormSection>
  );
};

export default ContentSection;