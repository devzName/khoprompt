import { useState } from 'react';
import { Card, Form, Input, Button, Space, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { extractVariables, fillVariables } from '../../utils/variable-parser';

/**
 * Strip HTML tags and decode common entities for plain-text clipboard output
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * VariablePlaceholderForm
 *
 * Parses [variable_name] brackets from prompt content and renders a fill-in form.
 * Returns null when no variables are found — caller keeps their own copy button.
 *
 * @param {object}  props
 * @param {string}  props.content  - Raw prompt content (may contain HTML from CKEditor)
 * @param {"default"|"small"} [props.size="default"]
 */
const VariablePlaceholderForm = ({ content, size = 'default' }) => {
  const variables = extractVariables(content || '');
  const [values, setValues] = useState({});

  // No variables found — render nothing, let parent handle copy
  if (variables.length === 0) return null;

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFillAndCopy = () => {
    const filled = fillVariables(content || '', values);
    const plain = stripHtml(filled);
    navigator.clipboard.writeText(plain).then(() => {
      message.success('Đã copy!');
    });
  };

  const handleCopyRaw = () => {
    const plain = stripHtml(content || '');
    navigator.clipboard.writeText(plain).then(() => {
      message.success('Đã copy!');
    });
  };

  return (
    <Card
      title="Điền biến"
      size="small"
      style={{ marginTop: 16 }}
    >
      <Form layout="vertical" size={size === 'small' ? 'small' : 'middle'}>
        {variables.map(name => (
          <Form.Item label={name} key={name} style={{ marginBottom: 8 }}>
            <Input
              placeholder={`Nhập ${name}...`}
              value={values[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
            />
          </Form.Item>
        ))}
      </Form>
      <Space style={{ marginTop: 8 }}>
        <Button type="primary" icon={<CopyOutlined />} onClick={handleFillAndCopy}>
          Copy đã điền
        </Button>
        <Button onClick={handleCopyRaw}>Copy gốc</Button>
      </Space>
    </Card>
  );
};

export default VariablePlaceholderForm;
