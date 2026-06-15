import { useState } from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import AddAccountModal from './AddAccountModal';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

function Sidebar({ activeFolder, onFolderChange, onCompose, accounts, activeAccount, onAccountsChange }) {
  const { user, logout } = useAuth();
  const [showAddAccount, setShowAddAccount] = useState(false);

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: 'inbox' },
    { id: 'sent', label: 'Sent', icon: 'send' },
    { id: 'drafts', label: 'Drafts', icon: 'draft' },
    { id: 'trash', label: 'Trash', icon: 'trash' },
  ];

  const handleRemoveAccount = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Remove this account?')) return;
    try {
      await api.accounts.remove(id);
      if (onAccountsChange) onAccountsChange();
    } catch (err) {
      console.error('Failed to remove account:', err);
    }
  };

  const handleSwitchAccount = async (id) => {
    try {
      await api.accounts.setActive(id);
      if (onAccountsChange) onAccountsChange();
    } catch (err) {
      console.error('Failed to switch account:', err);
    }
  };

  const handleAccountAdded = () => {
    setShowAddAccount(false);
    if (onAccountsChange) onAccountsChange();
  };

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <h1 className="sidebar__brand-title">MailBox</h1>
        <span className="sidebar__brand-pro">Pro</span>
        <div className="sidebar__brand-line" />
      </div>

      {/* Accounts */}
      <div className="sidebar__section-label">Accounts</div>
      <div className="sidebar__accounts">
        {(!accounts || accounts.length === 0) && (
          <div className="sidebar__loading">No accounts</div>
        )}
        {accounts &&
          accounts.map((acct) => (
            <div
              key={acct.id}
              className={`sidebar__account ${activeAccount && activeAccount.id === acct.id ? 'sidebar__account--active' : ''}`}
              onClick={() => handleSwitchAccount(acct.id)}
              title={acct.email}
            >
              <Avatar name={acct.name || acct.email} email={acct.email} size="sm" />
              <span className="sidebar__account-email">{acct.email}</span>
              <button
                className="sidebar__account-remove"
                onClick={(e) => handleRemoveAccount(e, acct.id)}
                title="Remove account"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        <button className="sidebar__add-account" onClick={() => setShowAddAccount(true)}>
          <Icon name="plus" size={14} />
          <span>Add Account</span>
        </button>
      </div>

      {/* Folders */}
      <div className="sidebar__section-label">Folders</div>
      <nav className="sidebar__folders">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`sidebar__folder ${activeFolder === folder.id ? 'sidebar__folder--active' : ''}`}
            onClick={() => onFolderChange(folder.id)}
          >
            <Icon
              name={folder.icon}
              size={18}
              color={activeFolder === folder.id ? '#b8974e' : '#787a85'}
            />
            <span className="sidebar__folder-label">{folder.label}</span>
            {folder.id === 'inbox' && activeFolder === 'inbox' && (
              <div className="sidebar__folder-badge">
                <Badge count={0} variant="brass" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Compose Button */}
      <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
        <button
          className="sidebar__add-account"
          style={{ border: '1px solid rgba(255,255,255,0.15)', justifyContent: 'center' }}
          onClick={onCompose}
        >
          <Icon name="plus" size={16} />
          <span>Compose</span>
        </button>
      </div>

      {/* User */}
      <div className="sidebar__user">
        <Avatar name={user?.name || user?.email} email={user?.email} size="sm" />
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{user?.name || user?.email || 'User'}</div>
          <div className="sidebar__user-email">{user?.email}</div>
        </div>
        <button className="sidebar__logout" onClick={logout} title="Logout">
          <Icon name="settings" size={18} />
        </button>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <AddAccountModal
          onClose={() => setShowAddAccount(false)}
          onSuccess={handleAccountAdded}
        />
      )}
    </div>
  );
}

export default Sidebar;