import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmailProvider, useEmail } from './contexts/EmailContext';
import AppShell from './components/AppShell';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import ComposeModal from './components/ComposeModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__brand">MailBox Pro</div>
        <div className="app-loading__spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainLayout() {
  const {
    accounts,
    activeAccount,
    selectedEmailId,
    currentFolder,
    composeMode,
    loadAccounts,
    selectEmail,
    setCurrentFolder,
    composeEmail,
    closeCompose,
    deleteEmail,
    refresh,
    refreshKey,
  } = useEmail();

  const handleFolderChange = (folder) => {
    setCurrentFolder(folder);
    selectEmail(null);
  };

  const handleReply = (email) => {
    composeEmail('reply', email);
  };

  const handleForward = (email) => {
    composeEmail('forward', email);
  };

  const handleDelete = (emailId) => {
    deleteEmail(emailId);
  };

  const handleComposeNew = () => {
    composeEmail('new');
  };

  const handleAccountsChange = () => {
    loadAccounts();
    refresh();
  };

  const composeProps =
    composeMode === 'new'
      ? { mode: 'new' }
      : composeMode
        ? {
            mode: composeMode.mode,
            replyTo: composeMode.mode === 'reply' ? composeMode.email : undefined,
            forwardEmail: composeMode.mode === 'forward' ? composeMode.email : undefined,
          }
        : null;

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            activeFolder={currentFolder}
            onFolderChange={handleFolderChange}
            onCompose={handleComposeNew}
            accounts={accounts}
            activeAccount={activeAccount}
            onAccountsChange={handleAccountsChange}
          />
        }
        list={
          <EmailList
            key={`${currentFolder}-${refreshKey}`}
            folder={currentFolder}
            selectedEmailId={selectedEmailId}
            onSelectEmail={selectEmail}
            onRefresh={refresh}
          />
        }
        detail={
          <EmailDetail
            emailId={selectedEmailId}
            onReply={handleReply}
            onForward={handleForward}
            onDelete={handleDelete}
          />
        }
      />

      {composeProps && (
        <ComposeModal
          {...composeProps}
          onClose={closeCompose}
          onSuccess={refresh}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <EmailProvider>
                  <MainLayout />
                </EmailProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;