import { Modal, notification, Input, Button, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';
const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
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
      notification.success({
        message: t('common.success', 'Success'),
        description: t('login.success', 'Đăng nhập thành công'),
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
  const handleMicrosoftLogin = async () => {
    try {
      setMicrosoftLoading(true);
      const loginResponse = await instance.loginPopup(loginRequest);
      if (loginResponse.accessToken) {
        const account = loginResponse.account;
        if (account && account.username) {
          const domain = account.username.split('@')[1];
          console.log('User domain:', domain);
        }
        const { access_token } = await authService.loginWithMicrosoft(loginResponse.accessToken);
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
          description: t('login.success', 'Đăng nhập thành công'),
          placement: 'topRight'
        });
        onLoginSuccess(user);
        onClose();
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      let errorMessage = t('login.error', 'Đăng nhập thất bại');
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = t('login.invalidMicrosoftToken', 'Microsoft access token không hợp lệ');
        } else if (status === 403) {
          errorMessage = t('login.organizationNotAllowed', 'Tài khoản không thuộc tổ chức được phép');
        } else if (status >= 500) {
          errorMessage = t('login.serverError', 'Lỗi máy chủ');
        }
      } else if (error.request) {
        errorMessage = t('login.networkError', 'Lỗi kết nối mạng');
      } else if (error.errorCode) {
        if (error.errorCode === 'user_cancelled') {
          return;
        }
        errorMessage = t('login.microsoftError', 'Lỗi đăng nhập Microsoft');
      }
      notification.error({
        message: t('common.error', 'Error'),
        description: errorMessage,
        placement: 'topRight'
      });
    } finally {
      setMicrosoftLoading(false);
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
            {t('login.welcome', 'Chào mừng')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('login.subtitle', 'Đăng nhập để tiếp tục')}
          </p>
        </div>
        <form onSubmit={handleFormLogin} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
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
          <div className="flex items-center justify-between">
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
        <Divider className="text-gray-400 text-xs sm:text-sm">{t('login.or', 'hoặc')}</Divider>
        <div className="w-full flex justify-center mb-4 sm:mb-6">
          <div className="w-full max-w-sm">
            <Button
              size="large"
              loading={microsoftLoading}
              onClick={handleMicrosoftLogin}
              className="w-full rounded-xl border-gray-300 font-medium flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500"
              icon={
                !microsoftLoading && (
                  <svg width="18" height="18" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1H11V11H1V1Z" fill="#F25022"/>
                    <path d="M12 1H22V11H12V1Z" fill="#7FBA00"/>
                    <path d="M1 12H11V22H1V12Z" fill="#00A4EF"/>
                    <path d="M12 12H22V22H12V12Z" fill="#FFB900"/>
                  </svg>
                )
              }
            >
              {microsoftLoading ? t('login.loggingIn', 'Đang đăng nhập...') : t('login.signInWithMicrosoft', 'Đăng nhập với Microsoft')}
            </Button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 px-2 mt-6">
          {t('login.footer', 'Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng')}
        </div>
      </div>
    </Modal>
  );
};
export default LoginModal;
