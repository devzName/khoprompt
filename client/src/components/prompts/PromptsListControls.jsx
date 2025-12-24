import { Input, Select, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const PromptsListControls = ({ 
  searchValue, 
  onSearchChange, 
  onCreatePrompt 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <Input
        size="large"
        placeholder={t('myPrompts.search')}
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchValue}
        onChange={onSearchChange}
        className="flex-1 sm:max-w-md rounded-lg"
        allowClear
      />
      
      <div className="flex gap-3 sm:gap-4">
        <Select
          size="large"
          defaultValue="all"
          className="flex-1 sm:w-32"
          options={[
            { value: 'all', label: t('myPrompts.all') },
            { value: 'public', label: t('myPrompts.public') },
            { value: 'private', label: t('myPrompts.private') },
          ]}
        />
        
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onCreatePrompt}
          className="bg-amber-600 hover:bg-amber-700 border-0 shrink-0"
        >
          <span className="hidden sm:inline">{t('myPrompts.createNew')}</span>
          <span className="sm:hidden">{t('myPrompts.createNew')}</span>
        </Button>
      </div>
    </div>
  );
};

export default PromptsListControls;