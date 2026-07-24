import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ShieldAlert, User, Mail, Lock, Phone, UserCheck, Eye, EyeOff, Upload, Calendar, ArrowLeft } from 'lucide-react';

export default function AuthPage({ defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  // Loading States
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Form Fields - Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regAge, setRegAge] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!/image\/(png|jpe?g)/.test(file.type)) {
        showToast('Only JPG, JPEG, and PNG images are supported for profile pictures.', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Profile picture size must not exceed 2MB.', 'error');
        return;
      }
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both your email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!regName || !regEmail || !regPhone || !regAge || !regPassword || !regConfirmPassword) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(regPhone.replace(/\s+/g, ''))) {
      showToast('Please enter a valid phone number (8-15 digits).', 'error');
      return;
    }

    const ageNum = parseInt(regAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      showToast('Please enter a realistic age (1 - 120).', 'error');
      return;
    }

    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', regName);
      formData.append('email', regEmail);
      formData.append('phone', regPhone);
      formData.append('gender', regGender);
      formData.append('age', regAge);
      formData.append('password', regPassword);
      if (profilePic) {
        formData.append('profileImage', profilePic);
      }

      await axios.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Clear register form values
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegAge('');
      setRegPassword('');
      setRegConfirmPassword('');
      setProfilePic(null);
      setProfilePicPreview('');

      // Redirect to login tab
      setActiveTab('login');
      showToast('Registration successful! Please sign in with your credentials.', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Registration failed. Server error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflowX: 'hidden',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
    }}>
      
      {/* Back button to homepage */}
      <motion.button
        whileHover={{ x: -4 }}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: '10px 16px',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'Poppins',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10
        }}
      >
        <ArrowLeft size={16} /> Back Home
      </motion.button>

      {/* Auth Container Card */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="card-clinical glass-card"
        style={{
          width: '100%',
          maxWidth: activeTab === 'register' ? '640px' : '440px',
          padding: '40px',
          zIndex: 1,
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 25px 60px rgba(37,99,235,0.1)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <motion.img 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            src="/akshar_logo.png"
            alt="Akshar AI Logo"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              objectFit: 'contain',
              margin: '0 auto 10px auto',
              display: 'block'
            }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Poppins' }}>Akshar AI</h1>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Powered Pneumonia Detection Platform</span>
        </div>

        {/* Tab switch buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--section-bg)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '28px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontFamily: 'Poppins',
              fontSize: '14px',
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontFamily: 'Poppins',
              fontSize: '14px',
              background: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* LOGIN PAGE */}
          {activeTab === 'login' && (
            <motion.form 
              key="login-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLoginSubmit}
            >
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Mail size={16} /></span>
                  <input
                    type="email"
                    placeholder="name@hospital.com"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <a 
                    href="#forgot" 
                    onClick={(e) => { e.preventDefault(); showToast("Compliance: Please contact system support.", "success"); }} 
                    style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Lock size={16} /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="remember" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
                  Remember my credentials
                </label>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', marginBottom: '16px' }} 
                disabled={loading}
              >
                {loading ? <div className="spinner"></div> : 'Sign In'}
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                <span>OR LOGIN WITH</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  showToast("Mock Google authentication enabled.", "success");
                  login("mock-google-token-12345", {
                    id: "google-mock-user-id",
                    name: "Clinical Practitioner",
                    email: "practitioner@google-health.com",
                    phone: "+1 800 555 9999",
                    gender: "Other",
                    age: 38,
                    profileImage: ""
                  });
                  navigate('/dashboard');
                }}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', gap: '10px', border: '1px solid var(--border-color)' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.56 2.69-3.86 2.69-6.6z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.91-2.26a5.58 5.58 0 0 1-8.51-2.93H.57v2.33A9 9 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.54 10.61a5.4 5.4 0 0 1 0-3.22V5.06H.57a9 9 0 0 0 0 7.88l2.97-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.05A9 9 0 0 0 .57 5.06l2.97 2.33A5.48 5.48 0 0 1 9 3.58z"/>
                </svg>
                Google Portal SSO
              </motion.button>
            </motion.form>
          )}

          {/* REGISTER PAGE */}
          {activeTab === 'register' && (
            <motion.form 
              key="register-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegisterSubmit}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><User size={16} /></span>
                    <input
                      type="text"
                      placeholder="Dr. John Doe"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Mail size={16} /></span>
                    <input
                      type="email"
                      placeholder="john@clinic.com"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Contact *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Phone size={16} /></span>
                    <input
                      type="tel"
                      placeholder="+1 555 123 4567"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Calendar size={16} /></span>
                    <input
                      type="number"
                      placeholder="35"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Image (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {profilePicPreview ? (
                      <img 
                        src={profilePicPreview} 
                        alt="avatar" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--section-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}><Upload size={16} /></div>
                    )}
                    <input 
                      type="file" 
                      id="profilePic"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profilePic" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '11.5px', borderRadius: '10px', cursor: 'pointer' }}>
                      Choose Avatar
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Lock size={16} /></span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }}><Lock size={16} /></span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '8px', margin: '12px 0 20px 0', alignItems: 'center' }}>
                <ShieldAlert size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                  By registering, you agree to comply with healthcare information safety standards.
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px' }} 
                disabled={loading}
              >
                {loading ? <div className="spinner"></div> : 'Create Clinical Account'}
              </motion.button>
            </motion.form>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
