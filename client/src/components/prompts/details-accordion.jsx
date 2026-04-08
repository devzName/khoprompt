import { useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import ImageUploadSection from './ImageUploadSection';

const { TextArea } = Input;

/** Collapsible accordion wrapping optional Notes + Images fields. Collapsed by default. */
const DetailsAccordion = ({ existingImages = [] }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        {open ? <DownOutlined aria-hidden="true" /> : <RightOutlined aria-hidden="true" />}
        <span>{t('myPrompts.createPrompt.details', 'Notes & Images')}</span>
        <span className="text-xs text-gray-400 ml-1">(optional)</span>
      </button>

      {open && (
        <div className="mt-4 space-y-6">
          <Form.Item
            label={<span className="text-sm text-gray-600 dark:text-gray-400">{t('myPrompts.createPrompt.notesLabel', 'Additional notes')}</span>}
            name="notes"
            className="mb-0"
          >
            <TextArea
              placeholder={t('myPrompts.createPrompt.notesPlaceholder', 'Add notes or usage instructions (optional)')}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
          <ImageUploadSection existingImages={existingImages} />
        </div>
      )}
    </div>
  );
};

export default DetailsAccordion;
