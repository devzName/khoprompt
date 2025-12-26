import { EyeOutlined, LikeOutlined, DislikeOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Drawer, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants/routes';

const PromptDrawer = ({ open, onClose, prompt }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCopy = () => {
    if (prompt?.content) {
      navigator.clipboard.writeText(prompt.content);
    }
  };

  const handleViewDetail = () => {
    navigate(ROUTES.PROMPT_DETAIL_PATH(prompt.id));
    onClose();
  };

  return (
    <Drawer
      title={prompt?.title}
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      className="prompt-drawer"
    >
      {prompt && (
        <div className="space-y-6">
          <div className="text-gray-600">
            {prompt.fullDescription}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('drawer.categoryTags')}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md">
                {typeof prompt.category === 'object' ? prompt.category?.name : prompt.category}
              </span>
              {prompt.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md">
                  {typeof tag === 'object' ? tag.name : tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <EyeOutlined />
              <span>{prompt.views?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <LikeOutlined className="text-green-600" />
              <span>{prompt.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <DislikeOutlined className="text-red-600" />
              <span>{prompt.dislikes}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('drawer.detailDescription')}</h3>
            <p className="text-gray-600">{prompt.fullDescription}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('drawer.promptContent')}</h3>
            <div className="bg-gray-50 rounded-lg p-4 relative">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {prompt.content}
              </pre>
              <Button
                icon={<CopyOutlined />}
                className="absolute top-2 right-2"
                size="small"
                onClick={handleCopy}
              >
                {t('drawer.copy')}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('drawer.author')}</h3>
            <p className="text-gray-600">{prompt.author}</p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="primary" 
              icon={<LikeOutlined />}
              className="flex-1"
            >
              {t('drawer.helpful')}
            </Button>
            <Button 
              icon={<DislikeOutlined />}
              className="flex-1"
            >
              {t('drawer.notHelpful')}
            </Button>
          </div>
          
          <Button 
            type="primary" 
            icon={<LinkOutlined />}
            className="w-full"
            size="large"
            onClick={handleViewDetail}
          >
            {t('drawer.viewDetail')}
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default PromptDrawer;