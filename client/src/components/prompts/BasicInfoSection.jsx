import { Form, Input, Button } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PromptFormSection from './PromptFormSection';
import aiService from '../../services/aiService';

const { TextArea } = Input;

const BasicInfoSection = () => {
  const { t } = useTranslation();
  const [isFormatting, setIsFormatting] = useState(false);
  const form = Form.useFormInstance();

  const handleAIFormat = async () => {
    const description = form.getFieldValue('description');
    
    if (!description || description.trim() === '') {
      return;
    }

    setIsFormatting(true);
    
    try {
      const result = await aiService.formatText(description, 'description');
      form.setFieldValue('description', result.formattedText);
    } catch (error) {
      console.error('AI formatting error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

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
        label={
          <div className="flex items-center gap-2">
            <span>{t('myPrompts.createPrompt.descriptionLabel')}</span>
            <Button
              type="text"
              size="small"
              icon={<ThunderboltOutlined />}
              loading={isFormatting}
              onClick={handleAIFormat}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('myPrompts.createPrompt.aiFormat')}
            </Button>
          </div>
        }
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