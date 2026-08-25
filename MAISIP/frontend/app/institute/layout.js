'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

function InstituteLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
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
      // RBAC check: only allow Institute here for now
      if (parsedUser.role !== 'institute') {
        alert('Access Denied. You are not registered as an Institute.');
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

  if (!user) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Institute Portal...</div>;

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${isSidebarMinimized ? styles.sidebarMinimized : ''}`}>
        <div className={styles.logoArea}>
          <div className={styles.logoWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0F172A' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <div className={styles.logoText}>
              MAISIP
              <span className={styles.logoSub}>INSTITUTE PORTAL</span>
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
          <Link href="/institute/dashboard" className={`${styles.navItem} ${pathname === '/institute/dashboard' ? styles.active : ''}`} title="Dashboard">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className={styles.navText}>Dashboard</span>
          </Link>
          <Link href="/institute/profile" className={`${styles.navItem} ${pathname === '/institute/profile' ? styles.active : ''}`} title="Institute Profile">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className={styles.navText}>Institute Profile</span>
          </Link>
          <Link href="/institute/athletes" className={`${styles.navItem} ${pathname.startsWith('/institute/athletes') ? styles.active : ''}`} title="Registered Athletes">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className={styles.navText}>Registered Athletes</span>
          </Link>
          <Link href="/institute/dashboard/register-athlete" className={`${styles.navItem} ${pathname === '/institute/dashboard/register-athlete' ? styles.active : ''}`} title="Athlete Registration">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            <span className={styles.navText}>Athlete Registration</span>
          </Link>
          <Link href="/institute/documents" className={`${styles.navItem} ${pathname === '/institute/documents' ? styles.active : ''}`} title="Institute Documents">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className={styles.navText}>Institute Documents</span>
          </Link>
          <Link href="/institute/ledger" className={`${styles.navItem} ${pathname === '/institute/ledger' ? styles.active : ''}`} title="Digital Ledger">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
            <span className={styles.navText}>Digital Ledger</span>
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

export default function InstituteLayout({ children }) {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Institute Portal...</div>}>
      <InstituteLayoutContent>{children}</InstituteLayoutContent>
    </Suspense>
  );
}
