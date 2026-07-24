import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';

// Import Pages
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useApp();
  const storedToken = localStorage.getItem('token');
  
  if (!token && !storedToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (Redirects logged-in users back to dashboard)
const PublicRoute = ({ children }) => {
  const { token } = useApp();
  const storedToken = localStorage.getItem('token');
  
  if (token || storedToken) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthPage defaultTab="login" />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <AuthPage defaultTab="register" />
            </PublicRoute>
          } 
        />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all 404 Route */}
        <Route 
          path="*" 
          element={
            <div style={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}>
              <h1 style={{ fontSize: '72px', margin: 0 }} className="gradient-text">404</h1>
              <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Page Not Found</h2>
              <p style={{ color: 'var(--text-secondary)' }}>The page you are looking for does not exist or has been moved.</p>
              <a href="/" className="btn btn-primary" style={{ marginTop: '12px' }}>Return Home</a>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
