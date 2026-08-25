'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

function AthleteLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isAchievementOpen, setIsAchievementOpen] = useState(pathname.startsWith('/athlete/achievements'));
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // RBAC check: only allow Athlete here for now
      if (parsedUser.role !== 'athlete') {
        alert('Access Denied. You are not registered as an Athlete.');
        router.push('/');
        return;
      }
      setTimeout(() => setUser(parsedUser), 0);
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/');
  };

  if (!user) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Athlete Dashboard...</div>;

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${isSidebarMinimized ? styles.sidebarMinimized : ''}`}>
        <div className={styles.logoArea}>
          <div className={styles.logoWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0F172A' }}>
              <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 6.7 1.4z" />
            </svg>
            <div className={styles.logoText}>
              MAISIP
              <span className={styles.logoSub}>ATHLETE PORTAL</span>
            </div>
          </div>
          <button 
            className={styles.toggleSidebarBtn} 
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            title={isSidebarMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isSidebarMinimized ? <polyline points="13 17 18 12 13 7"></polyline> : <polyline points="15 18 9 12 15 6"></polyline>}
            </svg>
          </button>
        </div>

        <nav className={styles.navMenu}>
          <Link href="/athlete/dashboard" className={`${styles.navItem} ${pathname === '/athlete/dashboard' ? styles.active : ''}`} title="Dashboard">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className={styles.navText}>Dashboard</span>
          </Link>
          <Link href="/athlete/profile" className={`${styles.navItem} ${pathname === '/athlete/profile' ? styles.active : ''}`} title="My Profile">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className={styles.navText}>My Profile</span>
          </Link>
          
          {/* Digital Ledger - Parent Item */}
          <div 
            className={`${styles.navItem} ${isAchievementOpen ? styles.parentActive : ''}`} 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (isSidebarMinimized) setIsSidebarMinimized(false);
              setIsAchievementOpen(!isAchievementOpen);
            }}
            title="Digital Ledger"
          >
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
            <span className={styles.navText}>Digital Ledger</span>
          </div>
          {isAchievementOpen && !isSidebarMinimized && (
            <div className={styles.subNav}>
              <Link href="/athlete/achievements/my-achievements" className={`${styles.navItem} ${pathname === '/athlete/achievements/my-achievements' ? styles.active : ''}`} style={{ padding: '8px 12px', fontSize: '14px' }}>
                <span className={styles.navText}>My Achievements</span>
              </Link>
              <Link href="/athlete/achievements/add" className={`${styles.navItem} ${pathname === '/athlete/achievements/add' ? styles.active : ''}`} style={{ padding: '8px 12px', fontSize: '14px' }}>
                <span className={styles.navText}>Add Achievements</span>
              </Link>
            </div>
          )}

          <Link href="/athlete/id-card" className={`${styles.navItem} ${pathname === '/athlete/id-card' ? styles.active : ''}`} title="My ID Card">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className={styles.navText}>My ID Card</span>
          </Link>

          <Link href="/athlete/documents" className={`${styles.navItem} ${pathname === '/athlete/documents' ? styles.active : ''}`} title="My Documents">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className={styles.navText}>My Documents</span>
          </Link>

          <Link href="/athlete/ai-analysis" className={`${styles.navItem} ${pathname === '/athlete/ai-analysis' ? styles.active : ''}`} title="AI Video Analysis">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span className={styles.navText}>AI Video Analysis</span>
          </Link>



        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {(user.username || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.firstName ? `${user.firstName} ${user.lastName}` : (user.username || user.email)}</div>
            </div>

            <button className={styles.logoutIconBtn} onClick={handleLogout} title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Page Content */}
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AthleteLayout({ children }) {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Athlete Portal...</div>}>
      <AthleteLayoutContent>{children}</AthleteLayoutContent>
    </Suspense>
  );
}
