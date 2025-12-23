import { useState } from 'react';
import { Input, Button, Select } from 'antd';
import { SearchOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';

const MyPromptsPage = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [user, setUser] = useState({
    name: 'Hoàng Sơn',
    email: '99hoangsonhoangksor99@...',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  });

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>{t('myPrompts.breadcrumb')}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{t('myPrompts.title')}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('myPrompts.title')}</h1>
          
          <div className="flex items-center gap-4">
            <Input
              size="large"
              placeholder={t('myPrompts.search')}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 max-w-md rounded-lg"
              allowClear
            />
            
            <Select
              size="large"
              defaultValue="all"
              className="w-32"
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
              className="bg-amber-600 hover:bg-amber-700 border-0"
            >
              {t('myPrompts.createNew')}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileTextOutlined className="text-4xl text-gray-400" />
            </div>
            <p className="text-gray-600 mb-6">{t('myPrompts.empty')}</p>
            <Button
              type="default"
              size="large"
              icon={<PlusOutlined />}
              className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 hover:border-amber-400"
            >
              {t('myPrompts.createFirst')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPromptsPage;
