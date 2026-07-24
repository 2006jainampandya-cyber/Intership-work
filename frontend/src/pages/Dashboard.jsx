import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  LayoutDashboard, UploadCloud, History, FileText, 
  User, Settings, LogOut, Sun, Moon, Search, Bell, 
  ChevronRight, Trash2, Download, Printer, 
  Lock, AlertTriangle, CheckCircle, RefreshCw, X, ShieldAlert, Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { 
    user, token, logout, 
    activePrediction, setActivePrediction, 
    theme, toggleTheme, showToast, updateUser 
  } = useApp();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  
  // Header Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'MobileNetV2 Model loaded and ready', read: false, time: 'Just now' }
  ]);

  const apiConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Page Transitions Variants
  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3 } }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  // ==========================================
  // PANEL 1: OVERVIEW STATES & UTILS
  // ==========================================
  const [stats, setStats] = useState({
    total: 0,
    pneumonia: 0,
    normal: 0,
    accuracy: 98.2,
    recentScans: []
  });

  const loadOverviewStats = async () => {
    try {
      const res = await axios.get('/api/uploads?limit=5', apiConfig);
      const historyRes = await axios.get('/api/uploads?limit=1000', apiConfig);
      const allScans = historyRes.data.predictions || [];
      const pneumoCount = allScans.filter(s => s.prediction === 'Pneumonia').length;
      
      setStats({
        total: allScans.length,
        pneumonia: pneumoCount,
        normal: allScans.length - pneumoCount,
        accuracy: "N/A", // We don't have a live accuracy metric
        recentScans: res.data.predictions || []
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverviewStats();
    }
  }, [activeTab]);

  // ==========================================
  // PANEL 2: UPLOAD STATES & LOGIC
  // ==========================================
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [gradcamError, setGradcamError] = useState(false);
  
  useEffect(() => {
    setImageError(false);
    setGradcamError(false);
  }, [activePrediction]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileBrowse = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (!/image\/(png|jpe?g)/.test(file.type)) {
      showToast('Unsupported format. Please upload JPEG, JPG, or PNG.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File is too large. Max allowed size is 5MB.', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      showToast('Please select a chest X-ray image first.', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      const res = await axios.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      clearInterval(interval);
      setUploadProgress(100);
      showToast('AI Analysis completed successfully!', 'success');
      
      setActivePrediction(res.data);
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setActiveTab('prediction');
      }, 500);

    } catch (err) {
      console.error(err);
      setUploading(false);
      setUploadProgress(0);
      showToast(err.response?.data?.message || 'AI prediction analysis failed.', 'error');
    }
  };

  // ==========================================
  // PANEL 3: PREDICTION ACTIONS
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async (predId) => {
    if (!predId) return;
    setDownloadingReportId(predId);
    showToast('Generating medical PDF report...', 'info');
    try {
      const response = await axios.get(`/api/report/${predId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = `AksharAI_Report_${predId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Clinical report downloaded.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Unable to generate report.', 'error');
    } finally {
      setDownloadingReportId(null);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}${path}`;
    console.log("React image URL:", url);
    return url;
  };

  // ==========================================
  // PANEL 4: HISTORY STATES & PAGINATION
  // ==========================================
  const [historyList, setHistoryList] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`/api/uploads?page=${historyPage}&limit=6&search=${historySearch}&filter=${historyFilter}`, apiConfig);
      setHistoryList(res.data.predictions || []);
      setHistoryTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('History load failed:', err);
      showToast('Could not load history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, historyPage, historyFilter]);

  const triggerHistorySearch = (e) => {
    e.preventDefault();
    setHistoryPage(1);
    loadHistory();
  };

  const handleDeleteHistoryItem = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this diagnostic record?')) return;
    try {
      await axios.delete(`/api/uploads/${id}`, apiConfig);
      showToast('Record deleted.', 'success');
      loadHistory();
    } catch (err) {
      showToast('Failed to delete record.', 'error');
    }
  };

  // ==========================================
  // PANEL 5: PROFILE EDIT STATES
  // ==========================================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profName, setProfName] = useState(user?.name || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [profGender, setProfGender] = useState(user?.gender || 'Male');
  const [profAge, setProfAge] = useState(user?.age || '');
  const [newAvatar, setNewAvatar] = useState(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      setNewAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profName);
      formData.append('phone', profPhone);
      formData.append('gender', profGender);
      formData.append('age', profAge);
      if (newAvatar) {
        formData.append('profileImage', newAvatar);
      }

      const res = await axios.put('/api/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      updateUser(res.data.user);
      setIsEditingProfile(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showToast('Please enter all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setChangingPass(true);
    try {
      await axios.put('/api/auth/change-password', { oldPassword, newPassword }, apiConfig);
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  // ==========================================
  // PANEL 6: SETTINGS ACTIONS
  // ==========================================
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleDeleteAccount = () => {
    if (window.confirm('🚨 WARNING: Are you sure you want to permanently delete your clinical profile? All files, scans, and reports will be deleted. This action is irreversible.')) {
      showToast('Account delete request sent to administrator.', 'error');
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)'
    }}>
      
      {/* Sidebar Panel */}
      <aside style={{
        width: '280px',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        gap: '28px',
        zIndex: 5
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('overview')}>
          <img 
            src="/akshar_logo.png"
            alt="Akshar AI Logo"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              objectFit: 'contain'
            }}
          />
          <div>
            <h2 style={{ fontSize: '16.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: 'Poppins' }}>Akshar AI</h2>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '-2px', fontWeight: 600 }}>AI Healthcare Portal</span>
          </div>
        </div>

        {/* Sidebar Navigation Options */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'upload', label: 'Upload X-ray', icon: <UploadCloud size={18} /> },
            { id: 'prediction', label: 'Prediction Result', icon: <Sparkles size={18} />, disabled: !activePrediction },
            { id: 'history', label: 'Prediction History', icon: <History size={18} /> },
            { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
            { id: 'settings', label: 'Portal Config', icon: <Settings size={18} /> }
          ].map(item => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => { if(!item.disabled) setActiveTab(item.id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'left',
                position: 'relative',
                background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                color: item.disabled ? 'var(--text-muted)' : (activeTab === item.id ? 'var(--primary)' : 'var(--text-secondary)'),
                transition: 'all var(--transition-fast)'
              }}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebarActive"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '0 4px 4px 0'
                  }}
                />
              )}
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar user footer */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="user avatar" 
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>{user?.name}</span>
              <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { logout(); navigate('/'); }}
            className="btn btn-secondary"
            style={{
              borderColor: 'var(--danger)',
              color: 'var(--danger)',
              padding: '10px',
              fontSize: '13px'
            }}
          >
            <LogOut size={15} /> Log Out
          </motion.button>
        </div>
      </aside>

      {/* Main Container Right */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Header bar */}
        <header className="glass" style={{
          height: '80px',
          padding: '0 4%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 4,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Poppins' }}>
              {activeTab === 'overview' && `Welcome back, ${user?.name}`}
              {activeTab === 'upload' && 'Analyze Chest X-ray'}
              {activeTab === 'prediction' && 'AI Diagnosis Analysis'}
              {activeTab === 'history' && 'Clinical Record Archive'}
              {activeTab === 'profile' && 'Clinical Profile Config'}
              {activeTab === 'settings' && 'Healthcare Portal Settings'}
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }} className="hide-on-mobile">
              <span style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }}><Search size={14} /></span>
              <input
                type="text"
                placeholder="Search scans, IDs..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '20px',
                  background: 'var(--section-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px'
                }}
                onClick={() => {
                  setActiveTab('history');
                  showToast('Search active scan history', 'success');
                }}
              />
            </div>

            {/* Theme */}
            <button 
              onClick={toggleTheme}
              style={{
                background: 'var(--section-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'var(--section-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                <Bell size={16} />
                {notifications.some(n => !n.read) && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    background: 'var(--danger)',
                    borderRadius: '50%'
                  }}></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="card-clinical glass-card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '44px',
                      width: '300px',
                      borderRadius: '12px',
                      padding: '16px',
                      zIndex: 100
                    }}
                  >
                    <h4 style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                      Notifications
                      <button 
                        onClick={() => {
                          setNotifications(notifications.map(n => ({ ...n, read: true })));
                          showToast('Notifications marked read', 'success');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: n.read ? 'transparent' : 'var(--primary-light)',
                          fontSize: '11.5px'
                        }}>
                          <p style={{ margin: 0, fontWeight: n.read ? 400 : 700 }}>{n.text}</p>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Panel Main Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 4%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview-panel"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="panel-container"
              >
                {/* Stats rows */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  {[
                    { label: 'Total Scans', count: stats.total, icon: <History size={20} />, bg: 'var(--primary-light)', col: 'var(--primary)' },
                    { label: 'Normal Scans', count: stats.normal, icon: <CheckCircle size={20} />, bg: 'rgba(34,197,94,0.1)', col: 'var(--success)' },
                    { label: 'Pneumonia Scans', count: stats.pneumonia, icon: <AlertTriangle size={20} />, bg: 'rgba(239,68,68,0.1)', col: 'var(--danger)' },
                    { label: 'Model Version', count: `MobileNetV2`, icon: <Sparkles size={20} />, bg: 'var(--accent-light)', col: 'var(--accent)' }
                  ].map((card, idx) => (
                    <motion.div 
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ translateY: -4 }}
                      className="card-clinical"
                      style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '20px' }}
                    >
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{card.label}</span>
                        <h3 style={{ fontSize: '28px', margin: 0, color: card.col, fontFamily: 'Poppins' }}>{card.count}</h3>
                      </div>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: card.bg, color: card.col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {card.icon}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid-2" style={{ marginTop: '12px' }}>
                  {/* SVG graph */}
                  <motion.div variants={itemVariants} className="card-clinical">
                    <h3 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--text-primary)' }}>AI Diagnostic History Trend</h3>
                    <div style={{ height: '200px', width: '100%' }}>
                      <svg viewBox="0 0 500 200" width="100%" height="100%">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <line x1="50" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeWidth="0.5" />
                        <line x1="50" y1="70" x2="480" y2="70" stroke="var(--border-color)" strokeWidth="0.5" />
                        <line x1="50" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeWidth="0.5" />
                        <line x1="50" y1="170" x2="480" y2="170" stroke="var(--border-color)" strokeWidth="1" />
                        
                        <path d="M 50 170 Q 120 130 190 145 T 330 85 T 480 50" fill="none" stroke="var(--primary)" strokeWidth="3.5" />
                        <path d="M 50 170 Q 120 130 190 145 T 330 85 T 480 50 L 480 170 L 50 170 Z" fill="url(#chartGrad)" />

                        <circle cx="330" cy="85" r="5.5" fill="var(--accent)" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="480" cy="50" r="5.5" fill="var(--primary)" stroke="#ffffff" strokeWidth="1.5" />

                        <text x="15" y="25" fill="var(--text-secondary)" fontSize="9" fontFamily="Inter">90%</text>
                        <text x="15" y="75" fill="var(--text-secondary)" fontSize="9" fontFamily="Inter">60%</text>
                        <text x="15" y="125" fill="var(--text-secondary)" fontSize="9" fontFamily="Inter">30%</text>
                        <text x="15" y="175" fill="var(--text-secondary)" fontSize="9" fontFamily="Inter">0%</text>
                      </svg>
                    </div>
                  </motion.div>

                  {/* Recent Scan items */}
                  <motion.div variants={itemVariants} className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, color: 'var(--text-primary)' }}>Recent Diagnostic Scans</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                      {stats.recentScans.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontWeight: 600 }}>No scans registered. Go to Upload X-ray.</div>
                      ) : (
                        stats.recentScans.map(scan => (
                          <div key={scan._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', background: 'var(--section-bg)', border: '1px solid var(--border-color)' }}>
                            <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={getImageUrl(scan.image)} alt="scan" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#1e293b', color: '#94a3b8', fontSize: '8px', fontWeight: 700, textAlign: 'center', lineHeight: '1' }}>No Img</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {scan.prediction.toUpperCase()}
                              </span>
                              <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Confidence: {scan.confidence}% • {new Date(scan.uploadDate).toLocaleDateString()}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setActivePrediction(scan);
                                setActiveTab('prediction');
                              }} 
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* UPLOAD PANEL */}
            {activeTab === 'upload' && (
              <motion.div 
                key="upload-panel"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="panel-container" 
                style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}
              >
                <motion.div 
                  whileHover={{ scale: dragActive ? 1.0 : 1.01 }}
                  className="upload-dropzone"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    backgroundColor: dragActive ? 'var(--section-bg)' : '#ffffff'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <UploadCloud size={32} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '6px', color: 'var(--text-primary)' }}>Drag and Drop X-ray Scan</h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Supported formats: PNG, JPG, or JPEG (Max 5 MB)</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
                    <div style={{ width: '40px', height: '1px', background: 'var(--border-color)' }}></div>
                  </div>

                  <input
                    type="file"
                    id="xray-file"
                    accept="image/*"
                    onChange={handleFileBrowse}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <label htmlFor="xray-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                    Browse Local Scans
                  </label>
                </motion.div>

                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-clinical" 
                    style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>📄</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedFile.name}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      {!uploading && (
                        <button 
                          onClick={() => setSelectedFile(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {uploading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                          <span>Executing CNN classification model...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <motion.div 
                            animate={{ width: `${uploadProgress}%` }}
                            style={{ height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }}
                          />
                        </div>
                      </div>
                    )}

                    {!uploading && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUploadSubmit} className="btn btn-primary" style={{ flex: 1 }}>
                          <Sparkles size={16} /> Run Diagnostic
                        </motion.button>
                        <button onClick={() => setSelectedFile(null)} className="btn btn-secondary">
                          Reset
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* PREDICTION PANEL */}
            {activeTab === 'prediction' && activePrediction && (
              <motion.div 
                key="prediction-panel"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="panel-container"
              >
                {/* Result banner card */}
                <div className="card-clinical" style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                  borderLeft: `6px solid ${activePrediction.prediction === 'Pneumonia' ? 'var(--danger)' : 'var(--success)'}`
                }}>
                  <div>
                    <span className={`badge-status ${activePrediction.prediction === 'Pneumonia' ? 'badge-pneumonia' : 'badge-normal'}`} style={{ marginBottom: '6px' }}>
                      {activePrediction.prediction} Diagnostic
                    </span>
                    <h2 style={{ fontSize: '26px', color: 'var(--text-primary)', fontFamily: 'Poppins' }}>
                      {activePrediction.prediction === 'Pneumonia' ? 'Signs of Pneumonia Detected' : 'Lungs Assessment Normal'}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 600 }}>
                      Scan ID: {activePrediction._id} • Diagnostic Date: {new Date(activePrediction.uploadDate).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePrint} className="btn btn-secondary">
                      <Printer size={16} /> Print
                    </motion.button>
                    <button onClick={() => { setActivePrediction(null); setActiveTab('upload'); }} className="btn btn-secondary">
                      New Scan
                    </button>
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '12px' }}>
                  {/* Images card */}
                  <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, color: 'var(--text-primary)' }}>Radiology Imaging</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '400px' }}>
                          {imageError ? (
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>No Image Available</span>
                          ) : (
                            <img src={getImageUrl(activePrediction.image)} alt="Original" onError={() => setImageError(true)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          )}
                        </div>
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 700 }}>Chest X-ray</span>
                      </div>
                    </div>
                  </div>

                  {/* Results details card */}
                  <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, color: 'var(--text-primary)' }}>Neural Diagnostics</h3>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        <span>AI Diagnostic Confidence</span>
                        <span style={{ color: 'var(--primary)' }}>{activePrediction.confidence}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${activePrediction.confidence}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ 
                            height: '100%', 
                            backgroundColor: activePrediction.prediction === 'Pneumonia' ? 'var(--danger)' : 'var(--success)', 
                            borderRadius: '4px' 
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Classification Process Time</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{activePrediction.processingTime}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Diagnostic Assessment</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{activePrediction.prediction === 'Pneumonia' ? 'Signs of pneumonia detected' : 'Clear pulmonary fields'}</strong>
                      </div>
                    </div>

                    <div className="glass-card" style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: 'auto'
                    }}>
                      <strong style={{ fontSize: '12.5px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={14} /> Medical Recommendations:
                      </strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                        {activePrediction.prediction === 'Pneumonia'
                          ? 'Immediate clinical correlation by a radiologist or pulmonologist is recommended. Consider auxiliary screening tests.'
                          : 'No distinct consolidations suggesting active pneumonia found. Review clinical signs (cough, dyspnea) if symptomatic.'}
                        <br/><br/>
                        <strong>Disclaimer:</strong> This AI tool is for research and demonstration purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HISTORY PANEL */}
            {activeTab === 'history' && (
              <motion.div 
                key="history-panel"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="panel-container"
              >
                {/* Search / filter header */}
                <form onSubmit={triggerHistorySearch} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}><Search size={16} /></span>
                    <input
                      type="text"
                      placeholder="Search by diagnosis classes..."
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-input"
                    style={{ width: '180px', cursor: 'pointer' }}
                    value={historyFilter}
                    onChange={(e) => {
                      setHistoryFilter(e.target.value);
                      setHistoryPage(1);
                    }}
                  >
                    <option value="">Show All Classes</option>
                    <option value="Normal">Normal Scan</option>
                    <option value="Pneumonia">Pneumonia</option>
                  </select>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary">
                    Filter Scans
                  </motion.button>
                </form>

                {/* History table view as requested by Guidelines */}
                {historyLoading ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner spinner-primary" style={{ margin: '0 auto 16px auto' }}></div>
                    <span>Loading record tables...</span>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="card-clinical" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }}>No scan records match your parameters.</p>
                    <button onClick={() => { setHistoryFilter(''); setHistorySearch(''); setHistoryPage(1); setActiveTab('upload'); }} className="btn btn-primary" style={{ marginTop: '12px' }}>
                      Run Diagnostic Scan
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="clinical-table">
                        <thead>
                          <tr>
                            <th>Scan Thumbnail</th>
                            <th>Prediction Diagnosis</th>
                            <th>AI Confidence</th>
                            <th>Diagnostic Timestamp</th>
                            <th>Classification Latency</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {historyList.map(item => (
                              <motion.tr 
                                key={item._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                              >
                                <td>
                                  <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={getImageUrl(item.gradcamImage)} alt="Scan Thumb" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8', fontSize: '7px', fontWeight: 700, textAlign: 'center', lineHeight: '1' }}>No Img</div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge-status ${item.prediction === 'Pneumonia' ? 'badge-pneumonia' : 'badge-normal'}`}>
                                    {item.prediction}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 700 }}>{item.confidence}%</td>
                                <td>{new Date(item.uploadDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                <td>{item.processingTime}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                                    <button 
                                      onClick={() => {
                                        setActivePrediction(item);
                                        setActiveTab('prediction');
                                      }}
                                      className="btn btn-secondary"
                                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px' }}
                                    >
                                      Open Report
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadPDF(item._id)}
                                      className="btn btn-secondary"
                                      style={{ padding: '6px 8px', borderRadius: '8px', color: 'var(--primary)' }}
                                      title="Download PDF"
                                      disabled={downloadingReportId === item._id}
                                    >
                                      {downloadingReportId === item._id ? (
                                        <RefreshCw size={14} style={{ animation: 'spin 1.2s linear infinite' }} />
                                      ) : (
                                        <Download size={14} />
                                      )}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteHistoryItem(item._id)}
                                      className="btn btn-secondary"
                                      style={{ padding: '6px 8px', borderRadius: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                      title="Delete Record"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination footer */}
                    {historyTotalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', alignItems: 'center' }}>
                        <button 
                          disabled={historyPage === 1}
                          onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          Prev
                        </button>
                        <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Page {historyPage} of {historyTotalPages}</span>
                        <button 
                          disabled={historyPage === historyTotalPages}
                          onClick={() => setHistoryPage(prev => Math.min(prev + 1, historyTotalPages))}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* PROFILE PANEL */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile-panel"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="panel-container" 
                style={{ maxWidth: '750px' }}
              >
                <div className="grid-2">
                  {/* Card profile summary */}
                  <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '18px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Avatar" 
                          style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} 
                        />
                      ) : (
                        <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)', fontFamily: 'Poppins' }}>{user?.name}</h3>
                      <span className="badge-status badge-processing">CLINICAL PRACTITIONER</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Email Address</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Phone Contact</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{user?.phone}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Age / Gender</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{user?.age} Yrs / {user?.gender}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Joined Portal Date</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'June 2026'}</strong>
                      </div>
                    </div>

                    {!isEditingProfile && (
                      <button onClick={() => setIsEditingProfile(true)} className="btn btn-primary" style={{ marginTop: '10px' }}>
                        <User size={16} /> Edit Profile Info
                      </button>
                    )}
                  </div>

                  {/* Forms edit details */}
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-primary)' }}>Edit General Details</h3>

                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" value={profName} onChange={(e) => setProfName(e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Contact</label>
                        <input type="tel" className="form-input" value={profPhone} onChange={(e) => setProfPhone(e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Age</label>
                          <input type="number" className="form-input" value={profAge} onChange={(e) => setProfAge(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <select className="form-input" value={profGender} onChange={(e) => setProfGender(e.target.value)}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Avatar</label>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                        {newAvatarPreview && <img src={newAvatarPreview} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '6px' }} />}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordChangeSubmit} className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-primary)' }}>Security Settings</h3>
                      
                      <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          className="form-input" 
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          className="form-input" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          className="form-input" 
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn btn-secondary" style={{ marginTop: '6px' }} disabled={changingPass}>
                        <Lock size={14} /> Update Security Key
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}

            {/* PORTAL CONFIG SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings-panel"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="panel-container" 
                style={{ maxWidth: '650px' }}
              >
                <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, color: 'var(--text-primary)' }}>Configure Portal Parameters</h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '14.5px', display: 'block', color: 'var(--text-primary)' }}>Portal Styling Theme</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Switch between Light Medical and Slate Dark templates.</span>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '14.5px', display: 'block', color: 'var(--text-primary)' }}>Clinical Dashboard Alerts</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Receive live status notifications upon complete prediction scans.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifEnabled}
                      onChange={(e) => {
                        setNotifEnabled(e.target.checked);
                        showToast(`Dashboard alerts ${e.target.checked ? 'activated' : 'deactivated'}`, 'success');
                      }}
                      style={{ width: '40px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '14.5px', display: 'block', color: 'var(--text-primary)' }}>Terminate Portal Logins</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Sign out of all other active browser sessions for this user profile.</span>
                    </div>
                    <button 
                      onClick={() => showToast('Other active device sessions terminated.', 'success')} 
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Sign Out All Devices
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '14.5px', display: 'block', color: 'var(--danger)' }}>Terminate Clinic Profile</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Permanently remove account databases, reports, and X-ray records.</span>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Delete Profile
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
