import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import Button from './Button';
import { api } from '../api';
import './ComposeModal.css';

const DRAFT_KEY = 'mailbox_pro_draft';

function ComposeModal({ mode = 'new', replyTo, forwardEmail, onClose, onSuccess }) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const saveTimerRef = useRef(null);

  // Pre-fill based on mode
  useEffect(() => {
    if (mode === 'reply' && replyTo) {
      setTo(replyTo.from || '');
      setSubject(`Re: ${replyTo.subject || ''}`);
      setBody('');
    } else if (mode === 'forward' && forwardEmail) {
      setSubject(`Fwd: ${forwardEmail.subject || ''}`);
      const originalBody = forwardEmail.body || forwardEmail.body_text || '';
      const from = forwardEmail.from_name || forwardEmail.from || '';
      const date = forwardEmail.date || forwardEmail.created_at || '';
      const originalSubject = forwardEmail.subject || '';
      setBody(
        `\n\n---------- Forwarded message ----------\nFrom: ${from}\nDate: ${date}\nSubject: ${originalSubject}\n\n${originalBody}`
      );
    } else {
      // Try to load saved draft
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.to) setTo(draft.to);
          if (draft.subject) setSubject(draft.subject);
          if (draft.body) setBody(draft.body);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [mode, replyTo, forwardEmail]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (to || subject || body) {
        const draft = { to, subject, body, cc, timestamp: Date.now() };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    }, 30000);

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [to, subject, body, cc]);

  const handleSend = async () => {
    setError('');

    if (!to.trim()) {
      setError('请输入收件人邮箱地址');
      return;
    }
    if (!subject.trim()) {
      setError('请输入邮件主题');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'reply' && replyTo) {
        await api.emails.reply(replyTo.id, { body, cc: cc.trim() || undefined });
      } else if (mode === 'forward' && forwardEmail) {
        await api.emails.forward(forwardEmail.id, { to: to.trim(), body, cc: cc.trim() || undefined });
      } else {
        await api.emails.send({ to: to.trim(), subject: subject.trim(), body, cc: cc.trim() || undefined });
      }

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || '邮件发送失败');
    } finally {
      setLoading(false);
    }
  };

  const titleMap = {
    new: '写邮件',
    reply: '回复',
    forward: '转发',
  };

  return (
    <div className="compose-overlay" onClick={onClose}>
      <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compose-modal__header">
          <h2 className="compose-modal__title">{titleMap[mode] || '写邮件'}</h2>
          <button className="compose-modal__close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="compose-modal__body">
          {error && <div className="compose-modal__error">{error}</div>}

          <div className="compose-modal__field">
            <label className="compose-modal__field-label">收件人</label>
            <input
              type="email"
              placeholder="收件人@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={mode === 'reply'}
            />
          </div>

          {showCc && (
            <div className="compose-modal__field">
              <label className="compose-modal__field-label">抄送</label>
              <input
                type="email"
                placeholder="抄送@example.com"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </div>
          )}

          {!showCc && mode === 'new' && (
            <button
              className="compose-modal__cc-toggle"
              onClick={() => setShowCc(true)}
              type="button"
            >
              <Icon name="plus" size={12} />
              添加抄送
            </button>
          )}

          <div className="compose-modal__field">
            <label className="compose-modal__field-label">主题</label>
            <input
              type="text"
              placeholder="邮件主题"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="compose-modal__field">
            <label className="compose-modal__field-label">内容</label>
            <textarea
              placeholder="写下你的邮件内容..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <div className="compose-modal__footer">
          <div className="compose-modal__footer-actions">
            <Button variant="ghost" onClick={onClose} type="button">
              <Icon name="trash" size={14} />
              丢弃
            </Button>
          </div>
          <div className="compose-modal__footer-actions">
            <Button variant="ghost" onClick={onClose} type="button">
              取消
            </Button>
            <Button variant="primary" onClick={handleSend} loading={loading}>
              <Icon name="send" size={14} />
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComposeModal;