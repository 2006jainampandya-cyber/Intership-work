import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Active Prediction details state (so Upload panel can redirect user directly to results dashboard tab)
  const [activePrediction, setActivePrediction] = useState(null);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Handle HTML document theme attribute syncing
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toast helper function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Login handler
  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    setActivePrediction(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
  };

  // Update profile user data handler
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Toggle Theme handler
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider value={{
      token,
      user,
      login,
      logout,
      updateUser,
      activePrediction,
      setActivePrediction,
      theme,
      toggleTheme,
      toast,
      showToast,
      setToast
    }}>
      {children}

      {/* Global Toast UI */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type} glass`}>
            <span style={{ fontSize: '20px' }}>
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <span style={{ fontWeight: 500, fontSize: '14.5px' }}>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                marginLeft: 'auto',
                fontSize: '16px',
                opacity: 0.7
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
