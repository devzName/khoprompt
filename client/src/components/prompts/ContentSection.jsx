import { Form, Button } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PromptFormSection from './PromptFormSection';
import aiService from '../../services/aiService';
const CKEditorWrapper = ({ value, onChange, placeholder }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        placeholder: placeholder,
        toolbar: [
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'outdent',
          'indent',
          '|',
          'blockQuote',
          'insertTable',
          '|',
          'undo',
          'redo'
        ],
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
          ]
        },
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        }
      }}
      data={value || ''}
      onChange={(_, editor) => {
        const data = editor.getData();
        onChange?.(data);
      }}
    />
  );
};
const ContentSection = () => {
  const { t } = useTranslation();
  const [isFormatting, setIsFormatting] = useState(false);
  const form = Form.useFormInstance();
  const content = Form.useWatch('content', form);

  const stripHtmlTags = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };
  const handleAIFormat = async () => {
    const content = form.getFieldValue('content');
    const title = form.getFieldValue('title');
    const plainText = stripHtmlTags(content);
    
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
      if (!content || plainText.trim() === '') {
        const result = await aiService.formatText(title, 'content');
        const formattedHtml = result.formattedText.replace(/\n/g, '<br>');
        form.setFieldValue('content', formattedHtml);
      } else {
        const result = await aiService.formatText(plainText, 'content');
        const formattedHtml = result.formattedText.replace(/\n/g, '<br>');
        form.setFieldValue('content', formattedHtml);
      }
    } catch (error) {
      console.error('AI formatting error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const getAIButtonLabel = () => {
    const plainText = stripHtmlTags(content);
    return (!content || plainText.trim() === '') 
      ? t('myPrompts.createPrompt.aiWrite', 'AI viết giúp')
      : t('myPrompts.createPrompt.aiEdit', 'AI sửa giúp');
  };
  return (
    <PromptFormSection title={t('myPrompts.createPrompt.content')}>
      <Form.Item
        label={
          <div className="flex items-center gap-2">
            <span>{t('myPrompts.createPrompt.contentLabel')}</span>
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
        name="content"
        rules={[{ required: true, message: t('myPrompts.createPrompt.contentRequired') }]}
        className="mb-0"
      >
        <CKEditorWrapper
          placeholder={t('myPrompts.createPrompt.contentPlaceholder')}
        />
      </Form.Item>
    </PromptFormSection>
  );
};
export default ContentSection;