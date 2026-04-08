import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';

/** Sticky action bar at the top of the create/edit form. */
const FormActions = ({ loading, onCancel, onSubmit, onMenuClick, isEditing = false, title }) => {
  const { t } = useTranslation();
  const pageTitle = title || (isEditing ? t('myPrompts.editPrompt.title') : t('myPrompts.createPrompt.title'));
  return (
    <PageHeader
      title={pageTitle}
      breadcrumb={t('myPrompts.title', 'My Prompts')}
      onMenuClick={onMenuClick}
    >
      <Button onClick={onCancel} disabled={loading}>
        {t('myPrompts.createPrompt.cancel')}
      </Button>
      <Button
        type="primary"
        loading={loading}
        icon={<SaveOutlined aria-hidden="true" />}
        onClick={onSubmit}
      >
        {isEditing ? t('common.save', 'Lưu thay đổi') : t('myPrompts.createPrompt.create')}
      </Button>
    </PageHeader>
  );
};

export default FormActions;
