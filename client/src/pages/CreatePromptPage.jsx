/**
 * Standalone page for creating and editing prompts.
 * Routes: /my-prompts/create  |  /my-prompts/:id/edit
 */
import { useState, useEffect } from 'react';
import { Form, Drawer, notification } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import { promptService } from '../services/promptService';
import { ROUTES } from '../constants/routes';
import Sidebar from '../components/Sidebar';
import CreatePromptForm from '../components/prompts/CreatePromptForm';

const CreatePromptPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeKey = 'my-prompts';
  const menuItems = useSidebarMenu(activeKey, user, navigate, null, t);

  // Edit mode: fetch prompt and pre-fill form
  useEffect(() => {
    if (!isEditing) return;
    promptService.getPromptById(id)
      .then((prompt) => {
        setInitialData(prompt);
        form.setFieldsValue({
          title: prompt.title,
          description: prompt.description,
          content: prompt.content,
          content_format: prompt.content_format || 'html',
          category: prompt.category_id,
          tags: prompt.tags?.map((tag) =>
            (typeof tag === 'object' ? tag.id : tag).toString()
          ) || [],
          notes: prompt.notes,
        });
      })
      .catch(() => {
        notification.error({ message: t('common.error'), placement: 'topRight' });
        navigate(ROUTES.MY_PROMPTS);
      });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Convert Ant Design form values → multipart FormData then call API */
  const handleFormFinish = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('content', values.content);
    formData.append('content_format', values.content_format || 'html');
    formData.append('category_id', values.category);
    if (values.notes) formData.append('notes', values.notes);
    formData.append(
      'tags',
      JSON.stringify(values.tags?.length ? values.tags.map((t) => parseInt(t, 10)) : [])
    );
    if (values.images?.length) {
      values.images.forEach((file) => formData.append('images', file));
    }
    if (values.existingImages?.length) {
      formData.append('existingImages', JSON.stringify(values.existingImages));
    }

    try {
      setLoading(true);
      if (isEditing) {
        await promptService.updatePrompt(id, formData);
        notification.success({
          message: t('common.success'),
          description: t('myPrompts.editPrompt.success'),
          placement: 'topRight',
        });
      } else {
        await promptService.createPrompt(formData);
        notification.success({
          message: t('common.success'),
          description: t('myPrompts.createPrompt.success'),
          placement: 'topRight',
        });
      }
      navigate(ROUTES.MY_PROMPTS);
    } catch {
      notification.error({
        message: t('common.error'),
        description: t('myPrompts.createPrompt.error'),
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#111]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar menuItems={menuItems} activeTab={activeKey} />
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={208}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar
          menuItems={menuItems}
          activeTab={activeKey}
          isMobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      {/* Main content — CreatePromptForm owns the <Form> internally */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CreatePromptForm
          form={form}
          loading={loading}
          onFormFinish={handleFormFinish}
          onCancel={() => navigate(ROUTES.MY_PROMPTS)}
          onMenuClick={() => setMobileMenuOpen(true)}
          isEditing={isEditing}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default CreatePromptPage;
