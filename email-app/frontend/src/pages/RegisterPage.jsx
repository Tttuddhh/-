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
      setError('Please enter your email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim() || undefined, email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Join MailBox Pro and take control of your email experience.
          </p>
          <div className="auth-page__brand-line" />
        </div>
      </div>

      <div className="auth-page__form">
        <div className="auth-page__card">
          <h2 className="auth-page__card-title">Create account</h2>
          <p className="auth-page__card-subtitle">Get started with MailBox Pro</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-page__error">{error}</div>}

            <div className="auth-page__form-group">
              <Input
                label="Name (optional)"
                type="text"
                id="register-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                id="register-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                id="register-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-page__actions">
              <Button type="submit" variant="primary" size="lg" loading={loading}>
                Create Account
              </Button>
            </div>

            <div className="auth-page__footer">
              Already have an account?
              <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;