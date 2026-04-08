/**
 * Modal to test a prompt in the Playground.
 * If the prompt has [variables], shows a fill form first.
 * Then creates a chat room and navigates to /playground/:roomId.
 */
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message as antMessage, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { extractVariables, fillVariables } from '../../utils/variable-parser';
import { chatService } from '../../services/chatService';
import { ROUTES } from '../../constants/routes';

const DEFAULT_MODEL = 'openai/gpt-oss-120b:free';

/** Strip HTML tags to plain text */
const stripHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html ?? '';
  return div.textContent || div.innerText || '';
};

const TestPromptModal = ({ prompt, open, onClose }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prompt && open) {
      const vars = extractVariables(prompt.content ?? '');
      setVariables(vars);
      form.resetFields();

      // No variables — create room immediately
      if (vars.length === 0) {
        handleCreate({});
      }
    }
  }, [prompt?.id, open]);

  const handleCreate = async (values) => {
    if (!prompt) return;
    setLoading(true);
    try {
      // Fill variable placeholders, then get plain-text version for message content
      const filled = fillVariables(prompt.content ?? '', values);
      const plainContent = stripHtml(filled);

      // Pick first free model (or default)
      let model = DEFAULT_MODEL;
      try {
        const models = await chatService.getModels();
        if (models?.length) model = models[0].id;
      } catch {
        // Use default silently
      }

      const room = await chatService.createRoom({
        title: prompt.title,
        model,
        source_prompt_id: prompt.id,
      });

      onClose();
      // Pass the filled prompt content as the initial message — PlaygroundPage will auto-send it
      navigate(ROUTES.PLAYGROUND_ROOM(room.id), { state: { initialMessage: plainContent } });
    } catch {
      antMessage.error('Không thể mở prompt trong Playground');
    } finally {
      setLoading(false);
    }
  };

  // No variables — modal was closed automatically, show nothing
  if (!prompt || variables.length === 0) {
    return (
      <Modal open={open && loading} footer={null} closable={false} centered width={300}>
        <div className="flex flex-col items-center gap-3 py-4">
          <Spin size="large" />
          <span className="text-sm text-gray-500">Đang mở Playground...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Điền biến trước khi thử"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      destroyOnClose
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Prompt này có các biến. Điền giá trị để sử dụng trong Playground.
      </p>

      <Form form={form} layout="vertical" onFinish={handleCreate}>
        {variables.map((varName) => (
          <Form.Item
            key={varName}
            label={varName}
            name={varName}
            rules={[{ required: true, message: `Vui lòng điền "${varName}"` }]}
          >
            <Input placeholder={`Giá trị cho [${varName}]`} />
          </Form.Item>
        ))}

        <div className="flex gap-2 justify-end mt-2">
          <Button onClick={onClose} disabled={loading}>Huỷ</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Mở Playground
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TestPromptModal;
