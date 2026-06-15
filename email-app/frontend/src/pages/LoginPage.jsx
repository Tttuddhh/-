import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import './AuthPages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || '登录失败，请检查邮箱和密码。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__brand">
        <div className="auth-page__brand-inner">
          <div className="auth-page__brand-icon">
            <Icon name="mail" size={56} color="#b8974e" />
          </div>
          <h1 className="auth-page__brand-title">MailBox</h1>
          <span className="auth-page__brand-title-accent">Pro</span>
          <p className="auth-page__brand-subtitle">
            管理多个邮箱账户的专业邮件客户端，简洁优雅。
          </p>
          <div className="auth-page__brand-line" />
        </div>
      </div>

      <div className="auth-page__form">
        <div className="auth-page__card">
          <h2 className="auth-page__card-title">欢迎回来</h2>
          <p className="auth-page__card-subtitle">登录你的 MailBox Pro 账户</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-page__error">{error}</div>}

            <div className="auth-page__form-group">
              <Input
                label="邮箱"
                type="email"
                id="login-email"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="密码"
                type="password"
                id="login-password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-page__actions">
              <Button type="submit" variant="primary" size="lg" loading={loading}>
                登录
              </Button>
            </div>

            <div className="auth-page__footer">
              还没有账户？
              <Link to="/register">注册一个</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;