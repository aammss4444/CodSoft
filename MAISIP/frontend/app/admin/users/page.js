'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './users.module.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role_id: '', first_name: '', last_name: ''
  });
  const router = useRouter();

  useEffect(() => {
    const handleAuthError = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      router.push('/');
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401 || res.status === 403) return handleAuthError();
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:5000/api/users/roles', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401 || res.status === 403) return handleAuthError();
        const data = await res.json();
        if (data.success) setRoles(data.roles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('User created successfully');
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', role_id: '', first_name: '', last_name: '' });
        fetchUsers();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <div className={styles.searchBar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search users by name, email, or role..." className={styles.searchInput} />
        </div>
        <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create User
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                </td>
                <td>{user.username}</td>
                <td style={{ fontWeight: 500 }}>{user.role || 'Unassigned'}</td>
                <td>
                  <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => toggleStatus(user.id, user.status)}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No users found in the system.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New User</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className={styles.input} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Temporary Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>System Role</label>
                  <select name="role_id" required value={formData.role_id} onChange={handleInputChange} className={styles.select}>
                    <option value="">Select a role...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
