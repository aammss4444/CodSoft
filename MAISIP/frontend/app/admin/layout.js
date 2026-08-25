'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

function AdminLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      // RBAC check: only allow System Administrator here for now
      if (parsedUser.role !== 'system_admin') {
        alert('Access Denied. You do not have administrator privileges.');
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

  if (!user) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Admin Panel...</div>;

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
              <span className={styles.logoSub}>ADMINISTRATION</span>
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
          <Link href="/admin/dashboard" className={`${styles.navItem} ${pathname.startsWith('/admin/dashboard') ? styles.active : ''}`} title="Dashboard">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className={styles.navText}>Dashboard</span>
          </Link>
          <Link href="/admin/users" className={`${styles.navItem} ${pathname.startsWith('/admin/users') ? styles.active : ''}`} title="User Management">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className={styles.navText}>User Management</span>
          </Link>

          <div className={styles.navGroup}>
            <Link href="/admin/verification" className={`${styles.navItem} ${pathname.startsWith('/admin/verification') ? styles.active : ''}`} title="Verification Center">
              <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span className={styles.navText}>Verification Center</span>
            </Link>
            {pathname.startsWith('/admin/verification') && !isSidebarMinimized && (
              <div className={styles.subNav}>
                <Link href="/admin/verification?tab=athletes" className={`${styles.subNavItem} ${searchParams.get('tab') === 'athletes' || !searchParams.get('tab') ? styles.subActive : ''}`}>
                  <span className={styles.navText}>Athlete Verification</span>
                </Link>
                <Link href="/admin/verification?tab=institutes" className={`${styles.subNavItem} ${searchParams.get('tab') === 'institutes' ? styles.subActive : ''}`}>
                  <span className={styles.navText}>Institute Verification</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/admin/ledger" className={`${styles.navItem} ${pathname.startsWith('/admin/ledger') ? styles.active : ''}`} title="Digital Ledger">
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
            <span className={styles.navText}>Digital Ledger</span>
          </Link>

          <Link href="/admin/ai-analysis" className={`${styles.navItem} ${pathname.startsWith('/admin/ai-analysis') ? styles.active : ''}`} title="AI Video Analysis">
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

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Admin Panel...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
