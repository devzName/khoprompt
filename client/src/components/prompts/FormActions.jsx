import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';

const FormActions = ({ loading, onCancel }) => {
  const { t } = useTranslation();

  return (
    <PromptFormSection title="" className="mb-0">
      <div className="flex justify-end gap-3">
        <Button size="large" onClick={onCancel} disabled={loading}>
          {t('myPrompts.createPrompt.cancel')}
        </Button>
        <Button 
          type="primary" 
          htmlType="submit"
          size="large"
          loading={loading}
          icon={<SaveOutlined />}
          className="bg-amber-600 hover:bg-amber-700 border-0"
        >
          {t('myPrompts.createPrompt.create')}
        </Button>
      </div>
    </PromptFormSection>
  );
};

export default FormActions;