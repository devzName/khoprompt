import { Modal, notification, Input, Button, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
      setEmail(savedEmail || '');
      setPassword(savedPassword || '');
      setRememberMe(true);
    }
  }, [open]);

  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      notification.error({
        message: t('common.error', 'Error'),
        description: t('login.fillAllFields'),
        placement: 'topRight'
      });
      return;
    }

    try {
      setFormLoading(true);

      const { access_token } = await authService.login(email, password);

      localStorage.setItem('access_token', access_token);

      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          email,
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

      if (!rememberMe) {
        setEmail('');
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

  const handleGoogleSuccess = async (idToken) => {
    try {
      setGoogleLoading(true);

      const { access_token } = await authService.loginWithGoogle(idToken);

      localStorage.setItem('access_token', access_token);

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
    } catch (error) {
      console.error('Google login error:', error);
      
      let errorMessage = t('login.error');
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = t('login.invalidGoogleToken');
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
      setGoogleLoading(false);
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

        <form onSubmit={handleFormLogin} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <Input
            size="large"
            placeholder={t('login.emailPlaceholder')}
            prefix={<UserOutlined className="text-gray-400" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <Divider className="text-gray-400 text-xs sm:text-sm">{t('login.or')}</Divider>

        <div className="w-full flex justify-center mb-4 sm:mb-6">
          <div className="w-full max-w-sm">
            {googleLoading ? (
              <Button
                size="large"
                loading={true}
                className="w-full rounded-xl border-gray-300 font-medium"
              >
                {t('login.loggingIn')}
              </Button>
            ) : (
              <GoogleLogin
                onSuccess={credentialResponse => {
                  handleGoogleSuccess(credentialResponse.credential);
                }}
                onError={() => {
                  console.error('Login Failed');
                  notification.error({
                    message: t('common.error', 'Error'),
                    description: t('login.error'),
                    placement: 'topRight'
                  });
                }}
                useOneTap={false}
                width="100%"
                theme="outline"
                shape="pill"
                size="large"
                text="signin_with"
              />
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 px-2">
          {t('login.footer')}
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
