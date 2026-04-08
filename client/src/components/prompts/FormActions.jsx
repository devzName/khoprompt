import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

/** Sticky action bar rendered at top of form — always visible while scrolling. */
const FormActions = ({ loading, onCancel, onSubmit, isEditing = false, title }) => {
  const { t } = useTranslation();
  return (
    <div className="shrink-0 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Left: breadcrumb/title hint */}
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {title || (isEditing ? t('myPrompts.editPrompt.title') : t('myPrompts.createPrompt.title'))}
        </span>
        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Button size="middle" onClick={onCancel} disabled={loading}>
            {t('myPrompts.createPrompt.cancel')}
          </Button>
          <Button
            type="primary"
            size="middle"
            loading={loading}
            icon={<SaveOutlined aria-hidden="true" />}
            onClick={onSubmit}
            className="bg-purple-600 hover:bg-purple-700 border-0"
          >
            {isEditing ? t('common.save', 'Lưu thay đổi') : t('myPrompts.createPrompt.create')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormActions;
