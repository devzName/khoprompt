import { Modal, message, Input, Button, Divider } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
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

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: email,
          password: password,
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { access_token, refresh_token } = await response.json();

      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      const meResponse = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!meResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await meResponse.json();
      const user = {
        ...userInfo,
        name: userInfo.full_name || userInfo.email.split('@')[0],
        picture: userInfo.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
      };

      localStorage.setItem('user', JSON.stringify(user));
      message.success(t('login.success'));
      onLoginSuccess(user);
      onClose();

      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      message.error(t('login.error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setLoading(true);

      // 1. Authenticate with backend using Google ID Token
      const response = await fetch('/api/v1/auth/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
      });

      if (!response.ok) {
        throw new Error('Backend authentication failed');
      }

      const { access_token, refresh_token } = await response.json();

      // 2. Store tokens
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      // 3. Get user info from backend
      const meResponse = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!meResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await meResponse.json();

      // For UI compatibility, ensure picture is present
      const user = {
        ...userInfo,
        name: userInfo.full_name || userInfo.email.split('@')[0],
        picture: userInfo.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`,
      };

      localStorage.setItem('user', JSON.stringify(user));

      message.success(t('login.success'));
      onLoginSuccess(user);
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      message.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };


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
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={credentialResponse => {
              handleGoogleSuccess(credentialResponse.credential);
            }}
            onError={() => {
              console.error('Login Failed');
              message.error(t('login.error'));
            }}
            useOneTap
            width="400"
            theme="outline"
            shape="pill"
          />
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          {t('login.footer')}
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
