import { Modal, message, Input, Button, Divider } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      message.error(t('login.fillAllFields'));
      return;
    }

    try {
      setFormLoading(true);
      
      // TODO: Implement actual login API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // Mock successful login for demo
      const mockUser = {
        name: email.split('@')[0],
        email: email,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        id: Date.now(),
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      message.success(t('login.success'));
      onLoginSuccess(mockUser);
      onClose();
      
      // Reset form
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      message.error(t('login.error'));
    } finally {
      setFormLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        
        const user = {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          googleId: userInfo.sub,
        };
        
        localStorage.setItem('access_token', tokenResponse.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        message.success(t('login.success'));
        onLoginSuccess(user);
        onClose();
      } catch (error) {
        console.error('Login error:', error);
        message.error(t('login.error'));
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      message.error(t('login.error'));
    },
    prompt: 'select_account',
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      className="login-modal"
    >
      <div className="py-6 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('login.welcome')}
          </h2>
          <p className="text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleFormLogin} className="space-y-4 mb-6">
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

        <Divider className="text-gray-400 text-sm">{t('login.or')}</Divider>

        {/* Google Login Button */}
        <button
          onClick={() => login()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleOutlined className="text-xl text-red-500" />
          <span>{loading ? t('login.loggingIn') : t('login.googleLogin')}</span>
        </button>

        <div className="text-center mt-6 text-xs text-gray-500">
          {t('login.footer')}
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
