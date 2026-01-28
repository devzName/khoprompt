import { useTranslation } from 'react-i18next';
import PageHeader from '../shared/PageHeader';
import PromptsTable from '../shared/PromptsTable';
import { Input } from 'antd';
const { Search } = Input;
const ReviewPromptsList = ({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onMenuClick,
  prompts = [],
  loading = false,
  onApprovePrompt,
  onRejectPrompt,
  currentUser,
  pagination = null,
  onTableChange
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col h-full">
      <PageHeader
        title={t('sidebar.reviewPrompts')}
        description={t('reviewPrompts.description', 'Duyệt và quản lý các prompts chờ phê duyệt')}
        breadcrumb={t('sidebar.reviewPrompts')}
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
        </div>
      </PageHeader>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full p-4 sm:p-6">
          <PromptsTable
            prompts={prompts}
            loading={loading}
            onApprovePrompt={onApprovePrompt}
            onRejectPrompt={onRejectPrompt}
            currentUser={currentUser}
            pagination={pagination}
            searchValue={searchValue}
            onTableChange={onTableChange}
            mode="review"
          />
        </div>
      </div>
    </div>
  );
};
export default ReviewPromptsList;