'use client';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/layout.module.css';

export default function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>
        {pathname === '/admin/dashboard' ? 'Overview' : 
         pathname === '/admin/users' ? 'User Management' : 
         pathname === '/admin/verification' ? 'Verification Center' : 'Administration'}
      </h1>
    </header>
  );
}
