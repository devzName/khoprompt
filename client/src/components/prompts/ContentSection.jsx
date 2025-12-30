import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PromptFormSection from './PromptFormSection';

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
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange?.(data);
      }}
    />
  );
};

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
        <CKEditorWrapper
          placeholder={t('myPrompts.createPrompt.contentPlaceholder')}
        />
      </Form.Item>
    </PromptFormSection>
  );
};

export default ContentSection;