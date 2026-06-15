import { useState, useEffect } from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import Button from './Button';
import { api } from '../api';
import './EmailDetail.css';

function EmailDetail({ emailId, onReply, onForward, onDelete, onClose }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!emailId) {
      setEmail(null);
      return;
    }

    setLoading(true);
    api.emails
      .get(emailId)
      .then((data) => {
        setEmail(data.email || data);
      })
      .catch((err) => {
        console.error('Failed to load email:', err);
        setEmail(null);
      })
      .finally(() => setLoading(false));
  }, [emailId]);

  const handleDelete = async () => {
    if (!email) return;
    if (!confirm('确定要将这封邮件移至废纸篓吗？')) return;
    try {
      await api.emails.delete(email.id);
      if (onDelete) onDelete(email.id);
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!emailId) {
    return (
      <div className="email-detail">
        <div className="email-detail__empty">
          <div className="email-detail__empty-icon">
            <Icon name="mail" size={64} color="#e5dfd5" />
          </div>
          <p>选择一封邮件阅读</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="email-detail">
        <div className="email-detail__loading">
          <div className="email-detail__spinner" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="email-detail">
        <div className="email-detail__empty">
          <p>邮件未找到</p>
        </div>
      </div>
    );
  }

  const senderName = email.from_name || email.from || '未知';
  const senderEmail = email.from || '';

  return (
    <div className="email-detail">
      {/* Actions */}
      <div className="email-detail__actions">
        {onClose && (
          <button className="email-detail__action-btn" onClick={onClose}>
            <Icon name="chevron-left" size={16} />
            返回
          </button>
        )}
        <div className="email-detail__action-spacer" />
        <button
          className="email-detail__action-btn"
          onClick={() => setStarred(!starred)}
          title={starred ? '取消收藏' : '收藏'}
        >
          <Icon name="star" size={16} color={starred ? '#b8974e' : undefined} />
        </button>
        <button
          className="email-detail__action-btn"
          onClick={() => onReply && onReply(email)}
        >
          <Icon name="reply" size={16} />
          回复
        </button>
        <button
          className="email-detail__action-btn"
          onClick={() => onForward && onForward(email)}
        >
          <Icon name="forward" size={16} />
          转发
        </button>
        <button
          className="email-detail__action-btn email-detail__action-btn--danger"
          onClick={handleDelete}
        >
          <Icon name="trash" size={16} />
          删除
        </button>
      </div>

      {/* Content */}
      <div className="email-detail__content">
        <h1 className="email-detail__subject">{email.subject || '(无主题)'}</h1>

        <div className="email-detail__meta">
          <Avatar name={senderName} email={senderEmail} size="lg" />
          <div className="email-detail__meta-info">
            <div className="email-detail__from">{senderName}</div>
            <div className="email-detail__from-email">{senderEmail}</div>
            <div className="email-detail__meta-row">
              <span>to</span> {email.to || '我'}
            </div>
            <div className="email-detail__time">
              {formatFullDate(email.date || email.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="email-detail__divider" />

      {/* Body */}
      <div className="email-detail__body">
        {email.body_html ? (
          <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
        ) : (
          <div className="email-detail__body-plain">
            {email.body || email.body_text || ''}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailDetail;