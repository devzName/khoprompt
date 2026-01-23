import { Form, Button } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PromptFormSection from './PromptFormSection';
import aiService from '../../services/aiService';

// Wrapper component để CKEditor hoạt động với Ant Design Form
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

  const stripHtmlTags = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleAIFormat = async () => {
    const content = form.getFieldValue('content');
    
    if (!content || stripHtmlTags(content).trim() === '') {
      return;
    }

    setIsFormatting(true);
    
    try {
      const plainText = stripHtmlTags(content);
      const result = await aiService.formatText(plainText, 'content');
      
      const formattedHtml = result.formattedText.replace(/\n/g, '<br>');
      form.setFieldValue('content', formattedHtml);
    } catch (error) {
      console.error('AI formatting error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <PromptFormSection title={t('myPrompts.createPrompt.content')}>
      <Form.Item
        label={
          <div className="flex items-center gap-2">
            <span>{t('myPrompts.createPrompt.contentLabel')}</span>
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