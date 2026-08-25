'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        
        if (data.user.role === 'system_admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'athlete') {
          router.push('/athlete/dashboard');
        } else if (data.user.role === 'institute') {
          router.push('/institute/dashboard'); // Or whatever the institute dashboard path is
        } else {
          // Other roles fallback
          router.push('/registration');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Unable to connect to the authentication server.');
    }
  };

  const handleRegistrationClick = () => {
    router.push('/registration');
  };

  return (
    <div className={styles.heroContainer}>
      <img src="/stadium_blue.png" alt="Athletes in Stadium" className={styles.bgImage} />
      <div className={styles.overlay}></div>
      
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <svg className={styles.logoIcon} width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 6.7 1.4z"/>
          </svg>
          <div className={styles.logoText}>
            MAHARASHTRA
            <span className={styles.logoSub}>SPORTS ECOSYSTEM</span>
          </div>
        </div>
        
        <button className={styles.navLoginBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Member Login
        </button>
      </nav>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        
        {/* Left Side: Hero Text and Features */}
        <div className={`${styles.leftContent} animate-fade-in`}>
          <h1 className={styles.heroTitle}>
            Empowering <span>Athletes.</span>
            Strengthening Maharashtra.
          </h1>
          <p className={styles.heroDesc}>
            A unified digital platform for athlete registration, development, and recognition across Maharashtra.
          </p>

          <div className={styles.actionButtons}>
            <button className={styles.primaryAction} onClick={handleRegistrationClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              Register Athlete
            </button>
            <button className={styles.secondaryAction} onClick={() => router.push('/institute-registration')}>
              Institute Registration
            </button>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className={`${styles.rightContent} animate-fade-in`}>
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Member Login</h2>
              <p className={styles.cardSubtitle}>Login to access your account</p>
            </div>

            <form onSubmit={handleAdminLogin}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Username / Email</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input type="text" className={styles.input} placeholder="Enter your username or email" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input type={showPassword ? "text" : "password"} className={styles.input} placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <svg 
                    className={styles.inputRightIcon} 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="3" y1="3" x2="21" y2="21"></line>
                      </>
                    )}
                  </svg>
                </div>
              </div>
              
              <div className={styles.formOptions}>
                <label className={styles.checkboxWrapper}>
                  <input type="checkbox" className={styles.checkbox} />
                  Remember me
                </label>
                <a href="#" className={styles.forgotLink}>Forgot Password?</a>
              </div>

              <button type="submit" className={styles.loginBtn}>
                Login
              </button>

              <div className={styles.secureDivider}>
                <svg className={styles.secureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                Secure Access
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
