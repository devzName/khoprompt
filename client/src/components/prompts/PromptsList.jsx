import { Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Search } = Input;
import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';
import PromptsTable from '../shared/PromptsTable';

const PromptsList = ({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onCreatePrompt,
  onMenuClick,
  prompts = [],
  loading = false,
  onSubmitPrompt,
  onEditPrompt,
  onDeletePrompt,
  currentUser,
  pagination = null,
  onTableChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('myPrompts.title')}
        description={t('myPrompts.description')}
        breadcrumb={t('myPrompts.title')}
        onMenuClick={onMenuClick}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              placeholder={t('myPrompts.searchPlaceholder')}
              value={searchValue}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
              className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 shadow-sm"
              size="large"
              allowClear
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreatePrompt}
            size="large"
            className="whitespace-nowrap rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t('myPrompts.createPrompt.title')}
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          <PromptsTable
            prompts={prompts}
            loading={loading}
            onSubmitPrompt={onSubmitPrompt}
            onEditPrompt={onEditPrompt}
            onDeletePrompt={onDeletePrompt}
            currentUser={currentUser}
            pagination={pagination}
            searchValue={searchValue}
            onCreatePrompt={onCreatePrompt}
            showCreateButton={true}
            onTableChange={onTableChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PromptsList;