import { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import Button from './Button';
import { api } from '../api';
import './EmailList.css';

function formatEmailTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function EmailList({ folder, selectedEmailId, onSelectEmail, onRefresh }) {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEmails = useCallback(async () => {
    setLoading(true);
    try {
      const params = { folder: folder || 'inbox', page };
      const data = await api.emails.list(params);
      setEmails(data.emails || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load emails:', err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [folder, page]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (!q) {
        loadEmails();
        return;
      }
      setLoading(true);
      try {
        const data = await api.emails.search(q);
        setEmails(data.emails || []);
        setTotalPages(1);
        setTotal(data.emails?.length || 0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = async (email) => {
    onSelectEmail(email.id);
    if (email.is_read === 0 || email.is_read === false) {
      try {
        await api.emails.toggleRead(email.id, 1);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const folderLabels = {
    inbox: 'Inbox',
    sent: 'Sent',
    drafts: 'Drafts',
    trash: 'Trash',
  };

  return (
    <div className="email-list">
      <div className="email-list__header">
        <h2 className="email-list__title">{folderLabels[folder] || 'Inbox'}</h2>
        <div className="email-list__search">
          <Icon name="search" size={14} color="#9a9ca5" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="email-list__loading">
          <div className="email-list__spinner" />
          <span>Loading emails...</span>
        </div>
      ) : emails.length === 0 ? (
        <div className="email-list__empty">
          <Icon name="inbox" size={48} color="#e5dfd5" />
          <p>No emails found</p>
        </div>
      ) : (
        <>
          <div className="email-list__items">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`email-list__item ${selectedEmailId === email.id ? 'email-list__item--selected' : ''} ${email.is_read === 0 || email.is_read === false ? 'email-list__item--unread' : ''}`}
                onClick={() => handleSelect(email)}
              >
                <div
                  className={`email-list__unread-dot ${email.is_read === 0 || email.is_read === false ? '' : 'email-list__unread-dot--read'}`}
                />
                <Avatar
                  name={email.from_name || email.from}
                  email={email.from}
                  size="md"
                />
                <div className="email-list__item-content">
                  <div className="email-list__item-top">
                    <span className="email-list__sender">
                      {email.from_name || email.from}
                    </span>
                    <span className="email-list__time">
                      {formatEmailTime(email.date || email.created_at)}
                    </span>
                  </div>
                  <div className="email-list__subject">{email.subject || '(No subject)'}</div>
                  <div className="email-list__snippet">
                    {email.snippet || email.body_preview || ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="email-list__pagination">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Icon name="chevron-left" size={14} />
                Previous
              </Button>
              <span className="email-list__page-info">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <Icon name="chevron-right" size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmailList;