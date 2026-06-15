import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const EmailContext = createContext(null);

export function EmailProvider({ children }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [loading, setLoading] = useState(false);
  const [composeMode, setComposeMode] = useState(null); // null | 'new' | { mode: 'reply', email } | { mode: 'forward', email }
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.accounts.list();
      const accts = data.accounts || data || [];
      setAccounts(accts);
      const active = accts.find((a) => a.is_active === 1 || a.is_active === true) || accts[0] || null;
      setActiveAccount(active);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }, []);

  const switchAccount = useCallback(async (id) => {
    try {
      await api.accounts.setActive(id);
      await loadAccounts();
    } catch (err) {
      console.error('Failed to switch account:', err);
    }
  }, [loadAccounts]);

  const loadEmails = useCallback(async (folder, page) => {
    setLoading(true);
    try {
      const data = await api.emails.list({ folder: folder || 'inbox', page: page || 1 });
      setEmails(data.emails || []);
      return data;
    } catch (err) {
      console.error('Failed to load emails:', err);
      setEmails([]);
      return { emails: [], total: 0, page: 1, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  }, []);

  const selectEmail = useCallback((id) => {
    setSelectedEmailId(id);
  }, []);

  const composeEmail = useCallback((mode, email) => {
    if (mode === 'new') {
      setComposeMode('new');
    } else if (mode === 'reply' && email) {
      setComposeMode({ mode: 'reply', email });
    } else if (mode === 'forward' && email) {
      setComposeMode({ mode: 'forward', email });
    }
  }, []);

  const closeCompose = useCallback(() => {
    setComposeMode(null);
  }, []);

  const sendEmail = useCallback(async (data) => {
    await api.emails.send(data);
    setRefreshKey((k) => k + 1);
  }, []);

  const deleteEmail = useCallback(async (id) => {
    await api.emails.delete(id);
    setSelectedEmailId(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const searchEmails = useCallback(async (q) => {
    setLoading(true);
    try {
      const data = await api.emails.search(q);
      setEmails(data.emails || []);
      return data;
    } catch (err) {
      console.error('Search failed:', err);
      return { emails: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Load accounts on mount
  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user, loadAccounts]);

  return (
    <EmailContext.Provider
      value={{
        accounts,
        activeAccount,
        emails,
        selectedEmailId,
        currentFolder,
        loading,
        composeMode,
        refreshKey,
        loadAccounts,
        switchAccount,
        loadEmails,
        selectEmail,
        setCurrentFolder,
        composeEmail,
        closeCompose,
        sendEmail,
        deleteEmail,
        searchEmails,
        refresh,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
}

export default EmailContext;