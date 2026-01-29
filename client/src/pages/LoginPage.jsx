import { useState, useEffect } from 'react';
import { Input, Button, Checkbox, Divider, notification, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';
import { PublicClientApplication } from '@azure/msal-browser';
import Logo from '../components/shared/Logo';

const LoginPage = ({ onLoginSuccess }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);
  const [msalLoading, setMsalLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [msalInstance, setMsalInstance] = useState(null);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getLanguageName = () => {
    const currentLang = i18n.language;
    return currentLang === 'vi' ? 'Tiếng Việt' : 'English';
  };

  const languageItems = [
    { key: 'vi', label: 'Tiếng Việt' },
    { key: 'en', label: 'English' },
  ];

  useEffect(() => {
    const initializeMsal = async () => {
      const msalConfig = {
        auth: {
          clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
          redirectUri: `${window.location.origin}/`,
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false,
        },
      };

      const pca = new PublicClientApplication(msalConfig);
      await pca.initialize();
      setMsalInstance(pca);
    };

    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
      setUsername(savedUsername || '');
      setPassword(savedPassword || '');
      setRememberMe(true);
    }

    initializeMsal();
  }, []);

  const handleMicrosoftLogin = async () => {
    if (!msalInstance) return;

    try {
      setMsalLoading(true);
      
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      });

      const idToken = loginResponse.idToken;

      const { access_token } = await authService.loginWithMicrosoft(idToken);
      localStorage.setItem('access_token', access_token);

      const userInfo = await authService.getCurrentUser();
      const user = {
        ...userInfo,
        name: userInfo.full_name || userInfo.email.split('@')[0],
        picture: userInfo.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
      };
      localStorage.setItem('user', JSON.stringify(user));

      onLoginSuccess(user);
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Microsoft login error:', error);
      let errorMessage = t('login.error', 'Đăng nhập thất bại');

      if (error.errorCode === 'user_cancelled') {
        errorMessage = t('login.cancelled', 'Đăng nhập bị hủy');
      } else if (error.response?.status === 401) {
        errorMessage = t('login.invalidCredentials', 'Thông tin đăng nhập không hợp lệ');
      } else if (error.response?.status >= 500) {
        errorMessage = t('login.serverError', 'Lỗi máy chủ');
      }

      notification.error({
        message: t('common.error', 'Error'),
        description: errorMessage,
        placement: 'topRight'
      });
    } finally {
      setMsalLoading(false);
    }
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      notification.error({
        message: t('common.error', 'Error'),
        description: t('login.fillAllFields', 'Vui lòng điền đầy đủ thông tin'),
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
      onLoginSuccess(user);
      navigate(ROUTES.HOME);
      if (!rememberMe) {
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = t('login.error', 'Đăng nhập thất bại');
      if (error.response) {
        const status = error.response.status;
        const errorDetail = error.response.data?.detail;
        if (status === 401) {
          if (errorDetail && errorDetail.includes('Invalid')) {
            errorMessage = t('login.invalidCredentials', 'Thông tin đăng nhập không hợp lệ');
          } else {
            errorMessage = t('login.invalidCredentials', 'Thông tin đăng nhập không hợp lệ');
          }
        } else if (status >= 500) {
          errorMessage = t('login.serverError', 'Lỗi máy chủ');
        }
      } else if (error.request) {
        errorMessage = t('login.networkError', 'Lỗi kết nối mạng');
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Dropdown
          menu={{
            items: languageItems,
            onClick: (e) => handleLanguageChange(e.key),
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <span
            className="text-white rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors"
          >
            <GlobalOutlined className="text-xl" />
            <span className="text-xs font-semibold">{getLanguageName()}</span>
          </span>
        </Dropdown>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Logo size="large" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {t('login.welcome', 'Chào mừng')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('login.subtitle', 'Đăng nhập để tiếp tục')}
          </p>
        </div>

        <form onSubmit={handleFormLogin} className="space-y-4 mb-6">
          <Input
            size="large"
            placeholder={t('login.usernamePlaceholder', 'Tên đăng nhập')}
            prefix={<UserOutlined className="text-gray-400" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl"
          />
          <Input.Password
            size="large"
            placeholder={t('login.passwordPlaceholder', 'Mật khẩu')}
            prefix={<LockOutlined className="text-gray-400" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl"
          />
          <div className="flex items-center">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="text-sm text-gray-600"
            >
              {t('login.rememberMe', 'Ghi nhớ đăng nhập')}
            </Checkbox>
          </div>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={formLoading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium"
          >
            {t('login.signIn', 'Đăng nhập')}
          </Button>
        </form>

        <Divider>{t('login.or', 'Hoặc')}</Divider>

        <Button
          type="default"
          size="large"
          loading={msalLoading}
          onClick={handleMicrosoftLogin}
          className="w-full rounded-xl font-medium border-gray-300 hover:border-blue-500 hover:text-blue-600"
        >
          <svg className="w-5 h-5 inline-block mr-2" viewBox="0 0 23 23" fill="currentColor">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="13" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="13" width="9" height="9" fill="#00A4EF" />
            <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
          </svg>
          {t('login.microsoftSignIn', 'Đăng nhập với Microsoft')}
        </Button>

        <div className="text-center text-xs text-gray-500 mt-6">
          {t('login.footer', 'Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng')}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
