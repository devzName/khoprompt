/**
 * Create / Edit skill page.
 * Routes: /skills/new  |  /skills/:id/edit
 */
import { useState, useEffect } from 'react';
import { Form, Drawer, notification, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSidebarMenu } from '../hooks/use-sidebar-menu.jsx';
import { skillService } from '../services/skillService';
import { ROUTES } from '../constants/routes';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/shared/PageHeader';
import SkillForm from '../components/skills/skill-form';

const SkillCreatePage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [initialData, setInitialData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = useSidebarMenu('my-skills', user, navigate, null, t);

  useEffect(() => {
    if (!isEditing) return;
    skillService.getSkill(id)
      .then((skill) => {
        setInitialData(skill);
        form.setFieldsValue({
          name: skill.name,
          description: skill.description,
          category: skill.category,
          tags: skill.tags || [],
          is_public: skill.is_public ?? false,
          agent_settings: skill.agent_settings || {},
        });
      })
      .catch(() => {
        notification.error({ message: t('common.error'), placement: 'topRight' });
        navigate(ROUTES.SKILLS);
      })
      .finally(() => setFetching(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinish = async (payload) => {
    try {
      setLoading(true);
      if (isEditing) {
        await skillService.updateSkill(id, payload);
        notification.success({
          message: t('common.success'),
          description: t('skills.editSuccess', 'Skill updated successfully'),
          placement: 'topRight',
        });
      } else {
        await skillService.createSkill(payload);
        notification.success({
          message: t('common.success'),
          description: t('skills.createSuccess', 'Skill created successfully'),
          placement: 'topRight',
        });
      }
      navigate(ROUTES.SKILLS);
    } catch {
      notification.error({
        message: t('common.error'),
        description: t('skills.saveError', 'Failed to save skill'),
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#111]">
      <div className="hidden lg:block border-r border-gray-100 dark:border-white/5">
        <Sidebar menuItems={menuItems} activeTab="my-skills" />
      </div>

      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={208}
        styles={{ body: { padding: 0 } }}
        closeIcon={null}
      >
        <Sidebar menuItems={menuItems} activeTab="my-skills" isMobile onClose={() => setMobileMenuOpen(false)} />
      </Drawer>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-gray-50 dark:bg-[#0d0d0d]">
        <PageHeader
          title={isEditing ? t('skills.editTitle', 'Edit Skill') : t('skills.createTitle', 'Create Skill')}
          description={isEditing ? t('skills.editDescription', 'Update your skill details.') : t('skills.createDescription', 'Add a new skill to your workspace.')}
          breadcrumb={isEditing ? t('skills.editTitle') : t('skills.createTitle')}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            {fetching ? (
              <div className="flex justify-center py-24"><Spin size="large" /></div>
            ) : (
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
                <SkillForm
                  form={form}
                  onFinish={handleFinish}
                  loading={loading}
                  initialData={initialData}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCreatePage;
