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
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
            Your professional email client for managing multiple accounts with ease and elegance.
          </p>
          <div className="auth-page__brand-line" />
        </div>
      </div>

      <div className="auth-page__form">
        <div className="auth-page__card">
          <h2 className="auth-page__card-title">Welcome back</h2>
          <p className="auth-page__card-subtitle">Sign in to your MailBox Pro account</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-page__error">{error}</div>}

            <div className="auth-page__form-group">
              <Input
                label="Email"
                type="email"
                id="login-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-page__actions">
              <Button type="submit" variant="primary" size="lg" loading={loading}>
                Sign In
              </Button>
            </div>

            <div className="auth-page__footer">
              Don&apos;t have an account?
              <Link to="/register">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;