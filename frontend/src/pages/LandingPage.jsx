import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Shield, Database, BrainCircuit, FileDown, 
  FileText, History, Zap, Mail, Phone, MapPin, 
  Github, Linkedin, ArrowRight, Sun, Moon
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');
  const { theme, toggleTheme, token } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  // Motion variants for pages
  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <div className="landing-container" style={{ background: 'var(--background)' }}>
      {/* Sticky Top Navbar */}
      <header className="glass" style={{
        position: 'sticky',
        top: 0,
        padding: '0 6%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        height: '80px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
          onClick={() => setActiveTab('home')}
        >
          <motion.img 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            src="/akshar_logo.png"
            alt="Akshar AI Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              objectFit: 'contain'
            }}
          />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)', fontFamily: 'Poppins' }}>
              Akshar AI
            </h1>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '-2px', fontWeight: 600 }}>
              AI Healthcare Platform
            </span>
          </div>
        </div>

        {/* Center Navigation Menu with Underline Animation */}
        <nav style={{ display: 'flex', gap: '4px', height: '100%', alignItems: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`navbar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeUnderline"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '16px',
                    right: '16px',
                    height: '3px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '99px'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              background: 'var(--section-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.2s'
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>

          {token ? (
            <motion.button 
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')} 
              className="btn btn-primary"
            >
              Go to Dashboard <ArrowRight size={16} />
            </motion.button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14.5px',
                  fontFamily: 'Poppins'
                }}
              >
                Login
              </button>
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')} 
                className="btn btn-primary"
              >
                Register
              </motion.button>
            </>
          )}
        </div>
      </header>

      {/* Main 100vh Content Screen Wrapper */}
      <main className="landing-main">
        <AnimatePresence mode="wait">
          
          {/* ==============================================
              1. HOME SECTION
             ============================================== */}
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="landing-section active"
              style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
            >
              <div className="grid-2" style={{ width: '100%', alignItems: 'center' }}>
                {/* Left side text content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '99px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--primary)',
                      width: 'fit-content',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      fontFamily: 'Poppins',
                      letterSpacing: '0.03em'
                    }}
                  >
                    <Activity size={15} /> CLINICAL GRADE AI TECHNOLOGY
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '50px', lineHeight: 1.1, color: 'var(--text-primary)', fontFamily: 'Poppins' }}
                  >
                    AI Powered <br />
                    <span style={{ color: 'var(--primary)' }}>Pneumonia Detection</span>
                  </motion.h1>
                  
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'Nunito' }}
                  >
                    Early Detection. Better Decisions. Better Patient Care.
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px', maxWidth: '520px', fontWeight: 500 }}
                  >
                    Upload chest X-ray images and receive automated diagnostics within seconds, complete with Grad-CAM heatmaps to visualize lung consolidations.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ display: 'flex', gap: '16px', marginTop: '10px' }}
                  >
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(token ? '/dashboard' : '/login')}
                      className="btn btn-primary"
                      style={{ padding: '14px 28px', fontSize: '15.5px' }}
                    >
                      Upload Image <ArrowRight size={18} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab('features')}
                      className="btn btn-secondary"
                      style={{ padding: '14px 28px', fontSize: '15.5px' }}
                    >
                      Learn More
                    </motion.button>
                  </motion.div>

                  {/* Telemetry Stats */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card" 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      padding: '18px',
                      borderRadius: '16px',
                      marginTop: '20px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '24px', color: 'var(--primary)', fontFamily: 'Poppins' }}>98%</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Accuracy Rate</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div>
                      <h3 style={{ fontSize: '24px', color: 'var(--accent)', fontFamily: 'Poppins' }}>5,000+</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Scans Processed</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div>
                      <h3 style={{ fontSize: '24px', color: 'var(--success)', fontFamily: 'Poppins' }}>24/7</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Availability</span>
                    </div>
                  </motion.div>
                </div>

                {/* Right side floating dashboard graphic */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  className="card-clinical glass-card"
                  style={{
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 50px rgba(37,99,235,0.08)'
                  }}
                >
                  <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-primary)' }}>
                    <BrainCircuit size={18} style={{ color: 'var(--primary)' }} /> AI Diagnostic Dashboard Preview
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        background: '#090d16', 
                        borderRadius: '12px', 
                        padding: '8px', 
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <rect x="0" y="0" width="100" height="100" fill="#090d16" />
                          <ellipse cx="35" cy="50" rx="15" ry="32" fill="#1b2535" opacity="0.8" />
                          <ellipse cx="65" cy="50" rx="15" ry="32" fill="#1b2535" opacity="0.8" />
                          <path d="M 22 25 Q 35 32 48 30 M 20 40 Q 35 48 48 45 M 20 55 Q 35 64 48 60" stroke="#4a5d78" strokeWidth="1.5" fill="none" opacity="0.5" />
                          <path d="M 78 25 Q 65 32 52 30 M 80 40 Q 65 48 52 45 M 80 55 Q 65 64 52 60" stroke="#4a5d78" strokeWidth="1.5" fill="none" opacity="0.5" />
                          <path d="M 50 15 L 50 85" stroke="#4a5d78" strokeWidth="3" strokeDasharray="3,3" opacity="0.4" />
                        </svg>
                        <span style={{ position: 'absolute', bottom: '6px', fontSize: '9px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', border: '1px solid #22c55e', fontWeight: 700 }}>NORMAL</span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', fontWeight: 700 }}>Normal X-ray</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        background: '#090d16', 
                        borderRadius: '12px', 
                        padding: '8px', 
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <rect x="0" y="0" width="100" height="100" fill="#090d16" />
                          <ellipse cx="35" cy="50" rx="15" ry="32" fill="#1b2535" opacity="0.8" />
                          <ellipse cx="65" cy="50" rx="15" ry="32" fill="#1b2535" opacity="0.8" />
                          <path d="M 22 25 Q 35 32 48 30 M 20 40 Q 35 48 48 45 M 20 55 Q 35 64 48 60" stroke="#4a5d78" strokeWidth="1.5" fill="none" opacity="0.5" />
                          <path d="M 78 25 Q 65 32 52 30 M 80 40 Q 65 48 52 45 M 80 55 Q 65 64 52 60" stroke="#4a5d78" strokeWidth="1.5" fill="none" opacity="0.5" />
                          <path d="M 50 15 L 50 85" stroke="#4a5d78" strokeWidth="3" strokeDasharray="3,3" opacity="0.4" />
                          <circle cx="32" cy="55" r="12" fill="#EF4444" opacity="0.55" filter="blur(2px)" />
                          <circle cx="32" cy="55" r="7" fill="#fbbf24" opacity="0.75" />
                        </svg>
                        <span style={{ position: 'absolute', bottom: '6px', fontSize: '9px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '2px 8px', borderRadius: '4px', border: '1px solid #EF4444', fontWeight: 700 }}>PNEUMONIA</span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', fontWeight: 700 }}>AI Grad-CAM Prediction</span>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--background)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Pneumonia Prediction</span>
                      <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '14.5px' }}>POSITIVE DETECTION</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Confidence Score</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14.5px' }}>97.84%</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ==============================================
              2. FEATURES SECTION
             ============================================== */}
          {activeTab === 'features' && (
            <motion.div 
              key="features"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="landing-section active"
            >
              <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
                    Clinical <span style={{ color: 'var(--primary)' }}>Diagnostic Suite</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }}>Advanced features designed to support radiology screening workflows.</p>
                </div>

                <div className="grid-3">
                  {[
                    { icon: <BrainCircuit size={24} />, title: 'CNN Classification', desc: 'Runs fine-tuned deep learning models locally or in the cloud to categorize scans with high sensitivity.' },
                    { icon: <Activity size={24} />, title: 'Grad-CAM Imaging', desc: 'Overlays thermal activation zones on radiographs to showcase consolidation markers to clinicians.' },
                    { icon: <FileDown size={24} />, title: 'Clinical PDF Reports', desc: 'Download professional summaries featuring side-by-side scans, parameters, and signature lines.' },
                    { icon: <History size={24} />, title: 'Record Archive', desc: 'Query and audit all historical patient scans, diagnoses, and scores inside a secure paginated grid.' },
                    { icon: <Shield size={24} />, title: 'Compliance & Protection', desc: 'User logs and medical uploads are fully encrypted using JWT standard security and password hashing.' },
                    { icon: <Zap size={24} />, title: 'Sub-Second Analysis', desc: 'High-speed cloud processing handles uploads, overlays, and database operations concurrently.' }
                  ].map((feat, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ translateY: -8 }}
                      className="card-clinical"
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '50%', 
                        background: 'var(--section-bg)', 
                        color: 'var(--primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(37,99,235,0.05)'
                      }}>
                        {feat.icon}
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{feat.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                        {feat.desc}
                      </p>
                      <a href="#learn" onClick={(e) => e.preventDefault()} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Learn More <ArrowRight size={12} />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ==============================================
              3. HOW IT WORKS
             ============================================== */}
          {activeTab === 'how-it-works' && (
            <motion.div 
              key="how-it-works"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="landing-section active"
              style={{ background: 'var(--section-bg)' }}
            >
              <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
                    Clinical <span style={{ color: 'var(--primary)' }}>Workflow Lifecycle</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }}>Simple integration into daily emergency and radiology checkups.</p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  width: '100%',
                  flexWrap: 'wrap',
                  gap: '24px'
                }}>
                  {/* Connector Line */}
                  <div style={{
                    position: 'absolute',
                    top: '50px',
                    left: '5%',
                    right: '5%',
                    height: '2.5px',
                    background: 'var(--border-color)',
                    zIndex: 1
                  }} className="hide-on-mobile"></div>

                  {[
                    { step: '1', title: 'Register Account', desc: 'Secure practitioner credentials.' },
                    { step: '2', title: 'Login', desc: 'Enter compliance portal.' },
                    { step: '3', title: 'Upload X-ray', desc: 'Drag-and-drop JPEG/PNG scans.' },
                    { step: '4', title: 'AI Analysis', desc: 'CNN classification runs.' },
                    { step: '5', title: 'Prediction Result', desc: 'Inspect localization maps.' },
                    { step: '6', title: 'Download Report', desc: 'Generate signed medical PDF.' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.05 }}
                      style={{
                        flex: '1',
                        minWidth: '130px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '3px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        boxShadow: 'var(--shadow-md)',
                        marginBottom: '12px'
                      }}>
                        {item.step}
                      </div>
                      <h4 style={{ fontSize: '13.5px', marginBottom: '4px', fontWeight: 700 }}>{item.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/register')}
                    className="btn btn-primary"
                    style={{ padding: '12px 28px' }}
                  >
                    Get Started Now <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==============================================
              4. ABOUT SECTION
             ============================================== */}
          {activeTab === 'about' && (
            <motion.div 
              key="about"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="landing-section active"
            >
              <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
                    Project <span style={{ color: 'var(--primary)' }}>Background</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }}>Learn about the deep neural framework and systems integration.</p>
                </div>

                <div className="grid-2">
                  <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ color: 'var(--text-primary)', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '8px' }}>Project Objective</h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                      The platform aims to assist radiologists and physicians in diagnostic screening. Our neural classification model provides instant diagnostic recommendations for pneumonia consolidation in chest X-rays.
                    </p>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                      By visually mapping out high-activation zones with Grad-CAM overlays, medical operators can instantly verify AI reasoning against physical diagnostic signs.
                    </p>
                  </div>

                  <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ color: 'var(--text-primary)', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '8px' }}>Technology Architecture</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>Deep Learning</strong>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>CNN Models, Grad-CAM, Jimp, Python APIs</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>Frontend Engine</strong>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>React.js, App Context, Framer Motion, CSS Modules</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>Backend Server</strong>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Python, Flask, PyJWT, TensorFlow prediction</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>Database Storage</strong>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>SQLite / PostgreSQL, Flask-SQLAlchemy ORM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==============================================
              5. CONTACT SECTION
             ============================================== */}
          {activeTab === 'contact' && (
            <motion.div 
              key="contact"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="landing-section active"
            >
              <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
                    Clinical <span style={{ color: 'var(--primary)' }}>Support Channels</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }}>Get in touch for institutional integrations and technical support.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="card-clinical" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--section-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Email Address</span>
                        <a href="mailto:support@pneumoai.org" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>support@pneumoai.org</a>
                      </div>
                    </div>

                    <div className="card-clinical" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--section-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Support Line</span>
                        <a href="tel:+18005557638" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>+1 (800) 555-PNEU</a>
                      </div>
                    </div>

                    <div className="card-clinical" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--section-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>HQ Location</span>
                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700 }}>Silicon Valley Healthcare Plaza, CA</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-clinical" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '16px' }}>Developer Hub</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                      Consult weights logs, training sets, integration guides, or clone scripts to synchronize local Flask predictions.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ flex: '1', padding: '10px', fontSize: '13px' }}>
                        <Github size={15} /> GitHub
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ flex: '1', padding: '10px', fontSize: '13px' }}>
                        <Linkedin size={15} /> LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
