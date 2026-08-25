'use client';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.dashboardGrid}>
      
      {/* Stat Card 1 */}
      <div className={styles.statCard}>
        <h3 className={styles.statLabel}>Total Athletes</h3>
        <div className={styles.statValue}>12,450</div>
        <div className={`${styles.statChange} ${styles.positiveChange}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          12% from last month
        </div>
      </div>

      {/* Stat Card 2 */}
      <div className={styles.statCard}>
        <h3 className={styles.statLabel}>Registered Institutes</h3>
        <div className={styles.statValue}>842</div>
        <div className={`${styles.statChange} ${styles.positiveChange}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          5% from last month
        </div>
      </div>

      {/* Stat Card 3 */}
      <div className={styles.statCard}>
        <h3 className={styles.statLabel}>Pending Approvals</h3>
        <div className={styles.statValue}>156</div>
        <div className={`${styles.statChange} ${styles.warningChange}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          Requires manual review
        </div>
      </div>

      <div className={styles.welcomeCard}>
        <h2 className={styles.welcomeTitle}>Welcome to MAISIP Administration</h2>
        <p className={styles.welcomeDesc}>
          This is the enterprise control center for the Maharashtra Sports Ecosystem. Use the sidebar to navigate to User Management, where you can securely create, update, and manage access roles for all platform stakeholders (Institutes, Athletes, and other Administrators).
        </p>
      </div>

    </div>
  );
}
