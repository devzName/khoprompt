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
  const description = Form.useWatch('description', form);

  const handleAIFormat = async () => {
    const description = form.getFieldValue('description');
    const title = form.getFieldValue('title');
    
    if (!title || title.trim() === '') {
      form.setFields([
        {
          name: 'title',
          errors: [t('myPrompts.createPrompt.titleRequired')]
        }
      ]);
      return;
    }
    
    if (title.trim().length < 20) {
      form.setFields([
        {
          name: 'title',
          errors: [t('myPrompts.createPrompt.titleMinLength')]
        }
      ]);
      return;
    }
    
    setIsFormatting(true);
    try {
      if (!description || description.trim() === '') {
        const result = await aiService.generateText(title, '', 'description');
        form.setFieldValue('description', result.formattedText);
      } else {
        const result = await aiService.improveText(title, description, 'description');
        form.setFieldValue('description', result.formattedText);
      }
    } catch (error) {
      console.error('AI formatting error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const getAIButtonLabel = () => {
    return (!description || description.trim() === '') 
      ? t('myPrompts.createPrompt.aiWrite', 'AI viết giúp')
      : t('myPrompts.createPrompt.aiEdit', 'AI sửa giúp');
  };
  return (
    <PromptFormSection title={t('myPrompts.createPrompt.basicInfo')}>
      <Form.Item
        label={t('myPrompts.createPrompt.titleLabel')}
        name="title"
        rules={[
          { required: true, message: t('myPrompts.createPrompt.titleRequired') },
          { min: 20, message: t('myPrompts.createPrompt.titleMinLength', 'Tiêu đề prompt ít nhất 20 ký tự') }
        ]}
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
              size="small"
              icon={<ThunderboltOutlined />}
              loading={isFormatting}
              onClick={handleAIFormat}
            >
              {getAIButtonLabel()}
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