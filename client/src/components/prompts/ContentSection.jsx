import { Form, Button, Radio } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import aiService from '../../services/aiService';

const MarkdownEditor = ({ value, onChange, placeholder }) => {
  return (
    <MDEditor
      value={value || ''}
      onChange={(val) => onChange?.(val || '')}
      height={400}
      preview="edit"
      textareaProps={{ placeholder }}
      visibleDragbar={false}
      className="markdown-editor"
    />
  );
};

const HTMLEditor = ({ value, onChange, placeholder }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        placeholder,
        toolbar: [
          'heading', '|', 'bold', 'italic', 'underline', '|',
          'bulletedList', 'numberedList', '|',
          'outdent', 'indent', '|',
          'blockQuote', 'insertTable', '|',
          'undo', 'redo'
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
        onChange?.(editor.getData());
      }}
    />
  );
};

const ContentSection = () => {
  const { t } = useTranslation();
  const [isFormatting, setIsFormatting] = useState(false);
  const form = Form.useFormInstance();
  const content = Form.useWatch('content', form);
  const contentFormat = Form.useWatch('content_format', form) || 'html';

  const handleAIFormat = async () => {
    const title = form.getFieldValue('title');
    const description = form.getFieldValue('description');

    if (!title || title.trim() === '') {
      form.setFields([{ name: 'title', errors: [t('myPrompts.createPrompt.titleRequired')] }]);
      return;
    }

    if (title.trim().length < 20) {
      form.setFields([{ name: 'title', errors: [t('myPrompts.createPrompt.titleMinLength')] }]);
      return;
    }

    setIsFormatting(true);
    try {
      if (!content || content.trim() === '') {
        const result = await aiService.generateText(title, description, 'content');
        form.setFieldValue('content', result.formattedText);
      } else {
        const result = await aiService.improveText(title, content, 'content');
        form.setFieldValue('content', result.formattedText);
      }
    } catch (error) {
      console.error('AI formatting error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const getAIButtonLabel = () => {
    return (!content || content.trim() === '')
      ? t('myPrompts.createPrompt.aiWrite', 'AI viết giúp')
      : t('myPrompts.createPrompt.aiEdit', 'AI sửa giúp');
  };

  const isHTML = contentFormat === 'html';
  const hasHTMLTags = content && /<[a-z][\s\S]*>/i.test(content);

  return (
    <div>
      {/* Format selector + AI button row */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: format toggle */}
        <Form.Item
          name="content_format"
          initialValue="html"
          className="mb-0"
        >
          <Radio.Group buttonStyle="solid" size="small">
            <Radio.Button value="html">HTML (Rich Text)</Radio.Button>
            <Radio.Button value="markdown">Markdown</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {hasHTMLTags && isHTML && (
            <Button
              size="small"
              type="link"
              onClick={() => {
                const div = document.createElement('div');
                div.innerHTML = content;
                const text = div.textContent || div.innerText || '';
                form.setFieldsValue({ content_format: 'markdown', content: text });
              }}
            >
              {t('myPrompts.createPrompt.convertToMarkdown', 'Chuyển sang Markdown (giữ text)')}
            </Button>
          )}
          <button
            type="button"
            disabled={isFormatting}
            onClick={handleAIFormat}
            className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <ThunderboltOutlined aria-hidden="true" />
            {isFormatting ? '...' : getAIButtonLabel()}
          </button>
        </div>
      </div>

      {/* Content editor — no label */}
      <Form.Item
        name="content"
        rules={[{ required: true, message: t('myPrompts.createPrompt.contentRequired') }]}
        className="mb-0"
      >
        {isHTML ? (
          <HTMLEditor placeholder={t('myPrompts.createPrompt.contentPlaceholder')} />
        ) : (
          <MarkdownEditor placeholder={t('myPrompts.createPrompt.contentPlaceholder')} />
        )}
      </Form.Item>
    </div>
  );
};

export default ContentSection;
