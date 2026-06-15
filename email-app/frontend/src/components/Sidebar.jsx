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
    { id: 'inbox', label: '收件箱', icon: 'inbox' },
    { id: 'sent', label: '已发送', icon: 'send' },
    { id: 'drafts', label: '草稿箱', icon: 'draft' },
    { id: 'trash', label: '废纸篓', icon: 'trash' },
  ];

  const handleRemoveAccount = async (e, id) => {
    e.stopPropagation();
    if (!confirm('确定要移除这个账户吗？')) return;
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
      <div className="sidebar__section-label">账户</div>
      <div className="sidebar__accounts">
        {(!accounts || accounts.length === 0) && (
          <div className="sidebar__loading">暂无账户</div>
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
                title="移除账户"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        <button className="sidebar__add-account" onClick={() => setShowAddAccount(true)}>
          <Icon name="plus" size={14} />
          <span>添加账号</span>
        </button>
      </div>

      {/* Folders */}
      <div className="sidebar__section-label">文件夹</div>
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
          <span>写邮件</span>
        </button>
      </div>

      {/* User */}
      <div className="sidebar__user">
        <Avatar name={user?.name || user?.email} email={user?.email} size="sm" />
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{user?.name || user?.email || '用户'}</div>
          <div className="sidebar__user-email">{user?.email}</div>
        </div>
        <button className="sidebar__logout" onClick={logout} title="退出登录">
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