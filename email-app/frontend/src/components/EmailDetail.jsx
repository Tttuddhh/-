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
    if (!confirm('Move this email to trash?')) return;
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
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!emailId) {
    return (
      <div className="email-detail">
        <div className="email-detail__empty">
          <div className="email-detail__empty-icon">
            <Icon name="mail" size={64} color="#e5dfd5" />
          </div>
          <p>Select an email to read</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="email-detail">
        <div className="email-detail__loading">
          <div className="email-detail__spinner" />
          <span>Loading email...</span>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="email-detail">
        <div className="email-detail__empty">
          <p>Email not found</p>
        </div>
      </div>
    );
  }

  const senderName = email.from_name || email.from || 'Unknown';
  const senderEmail = email.from || '';

  return (
    <div className="email-detail">
      {/* Actions */}
      <div className="email-detail__actions">
        {onClose && (
          <button className="email-detail__action-btn" onClick={onClose}>
            <Icon name="chevron-left" size={16} />
            Back
          </button>
        )}
        <div className="email-detail__action-spacer" />
        <button
          className="email-detail__action-btn"
          onClick={() => setStarred(!starred)}
          title={starred ? 'Unstar' : 'Star'}
        >
          <Icon name="star" size={16} color={starred ? '#b8974e' : undefined} />
        </button>
        <button
          className="email-detail__action-btn"
          onClick={() => onReply && onReply(email)}
        >
          <Icon name="reply" size={16} />
          Reply
        </button>
        <button
          className="email-detail__action-btn"
          onClick={() => onForward && onForward(email)}
        >
          <Icon name="forward" size={16} />
          Forward
        </button>
        <button
          className="email-detail__action-btn email-detail__action-btn--danger"
          onClick={handleDelete}
        >
          <Icon name="trash" size={16} />
          Delete
        </button>
      </div>

      {/* Content */}
      <div className="email-detail__content">
        <h1 className="email-detail__subject">{email.subject || '(No subject)'}</h1>

        <div className="email-detail__meta">
          <Avatar name={senderName} email={senderEmail} size="lg" />
          <div className="email-detail__meta-info">
            <div className="email-detail__from">{senderName}</div>
            <div className="email-detail__from-email">{senderEmail}</div>
            <div className="email-detail__meta-row">
              <span>to</span> {email.to || 'me'}
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