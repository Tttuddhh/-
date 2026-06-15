import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';
import './AuthPages.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!password || password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim() || undefined, email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || '注册失败，请重试。');
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
            加入 MailBox Pro，开启你的邮件管理之旅。
          </p>
          <div className="auth-page__brand-line" />
        </div>
      </div>

      <div className="auth-page__form">
        <div className="auth-page__card">
          <h2 className="auth-page__card-title">创建账户</h2>
          <p className="auth-page__card-subtitle">开始使用 MailBox Pro</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-page__error">{error}</div>}

            <div className="auth-page__form-group">
              <Input
                label="姓名（选填）"
                type="text"
                id="register-name"
                placeholder="你的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="邮箱"
                type="email"
                id="register-email"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="密码"
                type="password"
                id="register-password"
                placeholder="至少6个字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-page__actions">
              <Button type="submit" variant="primary" size="lg" loading={loading}>
                创建账户
              </Button>
            </div>

            <div className="auth-page__footer">
              已有账户？
              <Link to="/login">登录</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;