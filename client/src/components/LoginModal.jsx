import { Modal, notification, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
      setUsername(savedUsername || '');
      setPassword(savedPassword || '');
      setRememberMe(true);
    }
  }, [open]);

  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      notification.error({
        message: t('common.error', 'Error'),
        description: t('login.fillAllFields'),
        placement: 'topRight'
      });
      return;
    }

    try {
      setFormLoading(true);

      const { access_token } = await authService.login(username, password);

      localStorage.setItem('access_token', access_token);

      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          username,
          password
        }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }

      const userInfo = await authService.getCurrentUser();
      const user = {
        ...userInfo,
        name: userInfo.full_name || userInfo.email.split('@')[0],
        picture: userInfo.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
      };

      localStorage.setItem('user', JSON.stringify(user));
      notification.success({
        message: t('common.success', 'Success'),
        description: t('login.success'),
        placement: 'topRight'
      });
      onLoginSuccess(user);
      onClose();
      navigate(ROUTES.HOME);

      if (!rememberMe) {
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = t('login.error');
      
      if (error.response) {
        const status = error.response.status;
        const errorDetail = error.response.data?.detail;
        
        if (status === 401) {
          if (errorDetail && errorDetail.includes('Invalid')) {
            errorMessage = t('login.invalidCredentials');
          } else {
            errorMessage = t('login.invalidCredentials');
          }
        } else if (status >= 500) {
          errorMessage = t('login.serverError');
        }
      } else if (error.request) {
        errorMessage = t('login.networkError');
      }
      
      notification.error({
        message: t('common.error', 'Error'),
        description: errorMessage,
        placement: 'topRight'
      });
    } finally {
      setFormLoading(false);
    }
  };


  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 480 }}
      centered
      className="login-modal"
    >
      <div className="py-4 px-2 sm:py-6 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t('login.welcome')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleFormLogin} className="space-y-3 sm:space-y-4">
          <Input
            size="large"
            placeholder={t('login.usernamePlaceholder')}
            prefix={<UserOutlined className="text-gray-400" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl"
          />
          <Input.Password
            size="large"
            placeholder={t('login.passwordPlaceholder')}
            prefix={<LockOutlined className="text-gray-400" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl"
          />
          
          <div className="flex items-center justify-between">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="text-sm text-gray-600"
            >
              {t('login.rememberMe')}
            </Checkbox>
          </div>

          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={formLoading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium"
          >
            {t('login.signIn')}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 px-2 mt-6">
          {t('login.footer')}
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
