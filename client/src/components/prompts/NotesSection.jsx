import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';

const { TextArea } = Input;

const NotesSection = () => {
  const { t } = useTranslation();

  return (
    <PromptFormSection title={t('myPrompts.createPrompt.notes')}>
      <Form.Item
        label={t('myPrompts.createPrompt.notesLabel')}
        name="notes"
        className="mb-0"
      >
        <TextArea
          placeholder={t('myPrompts.createPrompt.notesPlaceholder')}
          rows={4}
          size="large"
        />
      </Form.Item>
    </PromptFormSection>
  );
};

export default NotesSection;