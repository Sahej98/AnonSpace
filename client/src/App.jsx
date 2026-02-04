import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Chat from './pages/Chat.jsx';
import About from './pages/About.jsx';
import Settings from './pages/Settings.jsx';
import MyPosts from './pages/MyPosts.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Rules from './pages/Rules.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import PostModal from './components/PostModal.jsx';
import Onboarding from './components/Onboarding.jsx';
import AuthSelection from './components/AuthSelection.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { UserProvider, useUser } from './contexts/UserContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { apiFetch } from './api.js';
import Header from './components/Header.jsx';

const FULL_WIDTH_ROUTES = ['/chat', '/settings', '/about', '/rules', '/admin'];

const AppLayout = () => {
  const location = useLocation();
  const { isAdmin } = useUser();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Check if the current route should be full width (no info panel)
  const isFullWidth = FULL_WIDTH_ROUTES.some((route) =>
    location.pathname.startsWith(route),
  );

  const handleAddPost = async (content, tags, type, pollOptions) => {
    try {
      const body = { content, tags, type };
      if (type === 'poll') body.pollOptions = pollOptions;

      const response = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit post');
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to add post:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <div className='app-wrapper'>
      <Header />
      <div className={`main-content ${isFullWidth ? 'full-width-mode' : ''}`}>
        <Sidebar />
        <main className='main-feed'>
          <Routes>
            <Route path='/' element={<Home sortOrder='hot' />} />
            <Route path='/top' element={<Home sortOrder='top' />} />
            <Route path='/tag/:tagName' element={<Home sortOrder='hot' />} />
            <Route path='/chat' element={<Chat />} />
            <Route path='/my-posts' element={<MyPosts />} />
            <Route path='/about' element={<About />} />
            <Route path='/rules' element={<Rules />} />
            <Route path='/settings' element={<Settings />} />
            {isAdmin && <Route path='/admin' element={<AdminDashboard />} />}
            <Route path='*' element={<Navigate to='/' />} />
          </Routes>
        </main>
        {!isFullWidth && <InfoPanel />}
      </div>
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddPost={handleAddPost}
      />
    </div>
  );
};

const AppContent = () => {
  const { appState } = useUser();

  if (appState === 'onboarding') return <Onboarding />;
  if (appState === 'auth') return <AuthSelection />;

  return <AppLayout />;
};

const App = () => {
  return (
    <>
      <ThemeProvider>
        <ToastProvider>
          <SocketProvider>
            <UserProvider>
              <Router>
                <AppContent />
              </Router>
            </UserProvider>
          </SocketProvider>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
