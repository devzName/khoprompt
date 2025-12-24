import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';
import PromptsListControls from './PromptsListControls';
import EmptyState from '../EmptyState';

const PromptsList = ({ 
  searchValue, 
  onSearchChange, 
  onCreatePrompt, 
  onMenuClick 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('myPrompts.title')}
        breadcrumb={t('myPrompts.title')}
        onMenuClick={onMenuClick}
      >
        <PromptsListControls
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onCreatePrompt={onCreatePrompt}
        />
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <EmptyState
          icon={FileTextOutlined}
          description={t('myPrompts.empty')}
          actionText={t('myPrompts.createFirst')}
          onAction={onCreatePrompt}
        />
      </div>
    </div>
  );
};

export default PromptsList;