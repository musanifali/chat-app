import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/layout/Navbar';
import PinLock from './components/pin/PinLock';
import { useAuthStore } from './store/authStore';
import usePinStore from './store/pinStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Friends from './pages/Friends';
import Profile from './pages/Profile';

import './index.css';

const Layout = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isLocked, isPinEnabled, lockApp, unlockApp } = usePinStore();
  const [showLock, setShowLock] = useState(false);

  // Lock app when it goes to background (mobile)
  useEffect(() => {
    if (!isAuthenticated || !isPinEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App going to background - lock it
        lockApp();
      }
    };

    // Also lock on page unload/reload
    const handleBeforeUnload = () => {
      lockApp();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, isPinEnabled, lockApp]);

  // Show lock screen when locked
  useEffect(() => {
    setShowLock(isAuthenticated && isPinEnabled && isLocked);
  }, [isAuthenticated, isPinEnabled, isLocked]);

  return (
    <>
      {isAuthenticated && <Navbar />}
      {showLock && <PinLock onUnlock={unlockApp} />}
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <PrivateRoute>
                  <Friends />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </SocketProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
