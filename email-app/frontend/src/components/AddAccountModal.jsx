import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Icon from './Icon';
import { api } from '../api';
import './AddAccountModal.css';

function AddAccountModal({ onClose, onSuccess }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    imap_host: '',
    imap_port: '993',
    smtp_host: '',
    smtp_port: '587',
    name: '',
    brevo_api_key: '',
    sendgrid_api_key: '',
    resend_api_key: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-detect hosts from email domain
      if (field === 'email' && val.includes('@')) {
        const domain = val.split('@')[1];
        if (!prev.imap_host) {
          next.imap_host = `imap.${domain}`;
        }
        if (!prev.smtp_host) {
          next.smtp_host = `smtp.${domain}`;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('邮箱地址和密码为必填项');
      return;
    }

    setLoading(true);
    try {
      await api.accounts.add({
        email: form.email.trim(),
        password: form.password,
        imap_host: form.imap_host.trim() || undefined,
        imap_port: form.imap_port ? parseInt(form.imap_port, 10) : undefined,
        smtp_host: form.smtp_host.trim() || undefined,
        smtp_port: form.smtp_port ? parseInt(form.smtp_port, 10) : undefined,
        name: form.name.trim() || undefined,
        brevo_api_key: form.brevo_api_key.trim() || undefined,
        sendgrid_api_key: form.sendgrid_api_key.trim() || undefined,
        resend_api_key: form.resend_api_key.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || '添加账户失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">添加邮箱账号</h2>
          <button className="modal__close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {error && <div className="modal__error">{error}</div>}

            <div className="modal__form-group">
              <Input
                label="邮箱地址"
                type="email"
                placeholder="请输入邮箱地址"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
              <Input
                label="密码"
                type="password"
                placeholder="邮箱账户密码"
                value={form.password}
                onChange={handleChange('password')}
                required
              />
              <Input
                label="显示名称"
                type="text"
                placeholder="你的姓名（选填）"
                value={form.name}
                onChange={handleChange('name')}
              />
              <div className="modal__form-row">
                <Input
                  label="IMAP 服务器"
                  type="text"
                  placeholder="imap.mail.com"
                  value={form.imap_host}
                  onChange={handleChange('imap_host')}
                />
                <Input
                  label="IMAP 端口"
                  type="text"
                  placeholder="993"
                  value={form.imap_port}
                  onChange={handleChange('imap_port')}
                />
              </div>
              <div className="modal__form-row">
                <Input
                  label="SMTP 服务器"
                  type="text"
                  placeholder="smtp.mail.com"
                  value={form.smtp_host}
                  onChange={handleChange('smtp_host')}
                />
                <Input
                  label="SMTP 端口"
                  type="text"
                  placeholder="587"
                  value={form.smtp_port}
                  onChange={handleChange('smtp_port')}
                />
              </div>

              <button
                type="button"
                className="modal__advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Icon name={showAdvanced ? 'chevron-down' : 'chevron-right'} size={16} />
                高级设置
              </button>

              {showAdvanced && (
                <div className="modal__advanced">
                  <div className="modal__advanced-section">
                    <span className="modal__advanced-label modal__advanced-label--recommend">推荐</span>
                    <div className="modal__advanced-hint">
                      使用 <strong>Brevo</strong> 发送邮件——只需验证你的邮箱地址（点击确认链接即可），无需域名 DNS 配置。
                      免费 300 封/天。在{' '}
                      <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer">
                        app.brevo.com
                      </a>{' '}
                      创建 API Key（格式：xkeysib-xxxxx）。
                    </div>
                    <Input
                      label="Brevo API Key"
                      type="password"
                      placeholder="xkeysib-xxxxxxxxxxxxx"
                      value={form.brevo_api_key}
                      onChange={handleChange('brevo_api_key')}
                    />
                  </div>

                  <div className="modal__advanced-section">
                    <span className="modal__advanced-label">备选 1</span>
                    <div className="modal__advanced-hint">
                      <strong>SendGrid</strong> ——只需验证单个邮箱地址。免费 100 封/天。在{' '}
                      <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer">
                        app.sendgrid.com
                      </a>{' '}
                      创建 API Key（格式：SG.xxxxx）。
                    </div>
                    <Input
                      label="SendGrid API Key"
                      type="password"
                      placeholder="SG.xxxxxxxxxxxxx"
                      value={form.sendgrid_api_key}
                      onChange={handleChange('sendgrid_api_key')}
                    />
                  </div>

                  <div className="modal__advanced-section">
                    <span className="modal__advanced-label">备选 2</span>
                    <div className="modal__advanced-hint">
                      <strong>Resend</strong> ——需先验证域名所有权（配置 SPF/DKIM DNS 记录）。在{' '}
                      <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                        resend.com/api-keys
                      </a>{' '}
                      获取 API Key。
                    </div>
                    <Input
                      label="Resend API Key"
                      type="password"
                      placeholder="re_xxxxxxxxxxxxx"
                      value={form.resend_api_key}
                      onChange={handleChange('resend_api_key')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal__footer">
            <Button variant="ghost" onClick={onClose} type="button">
              取消
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              添加账号
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAccountModal;