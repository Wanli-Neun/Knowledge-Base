'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './profile.module.scss';
import Toast from '@/app/components/Toast';

type UserProfile = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
  createdAt?: string;
};

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editValues, setEditValues] = useState({ fullName: '', displayName: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [passwordValues, setPasswordValues] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch specific user profile by userId
        const res = await fetch(`/api/users/${userId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleEditProfile = () => {
    if (profile) {
      setEditValues({
        fullName: profile.fullName,
        displayName: profile.displayName
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValues({ fullName: '', displayName: '' });
  };

  const handleSaveProfile = async () => {
    if (!editValues.fullName.trim() || !editValues.displayName.trim()) {
      setToast({ message: 'Full Name and Display Name are required', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: editValues.fullName,
          displayName: editValues.displayName,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const data = await res.json();
      
      // Update profile with new data
      setProfile(data);
      setIsEditing(false);
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setPasswordValues({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setPasswordValues({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSavePassword = async () => {
    // Validation
    if (!passwordValues.oldPassword) {
      setToast({ message: 'Please enter your current password', type: 'error' });
      return;
    }
    if (!passwordValues.newPassword) {
      setToast({ message: 'Please enter a new password', type: 'error' });
      return;
    }
    if (passwordValues.newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordValues.oldPassword,
          newPassword: passwordValues.newPassword,
          confirmPassword: passwordValues.confirmPassword,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setIsChangingPassword(false);
      setPasswordValues({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setToast({ message: 'Password changed successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to change password:', err);
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to change password', 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2>Failed to Load Profile</h2>
          <p>{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.userId === profile.userId;

  const handleBack = () => {
    // Check if we saved a project to return to
    const returnToProject = sessionStorage.getItem('returnToProject');
    
    if (returnToProject) {
      // Clear the saved project
      sessionStorage.removeItem('returnToProject');
      // Navigate to project members tab
      window.location.href = `/projects/${returnToProject}?tab=members`;
    } else if (document.referrer && document.referrer.includes('/projects/')) {
      // Fallback to browser back
      window.history.back();
    } else {
      // Default to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={handleBack} title="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.profileCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {profile.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.displayName}>{profile.displayName}</h1>
              <p className={styles.fullName}>{profile.fullName}</p>
            </div>
          </div>
          
          {isOwnProfile && (
            <div className={styles.actions}>
              <button className={styles.editButton} onClick={handleEditProfile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit Profile
              </button>
              <button className={styles.passwordButton} onClick={handleChangePassword}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Change Password
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Information</h2>
            {isOwnProfile && isEditing && (
              <div className={styles.editActions}>
                <button className={styles.cancelButton} onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </button>
                <button className={styles.saveButton} onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Email
              </div>
              <div className={styles.infoValue}>{profile.email}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Full Name
              </div>
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  className={styles.editInput}
                  value={editValues.fullName}
                  onChange={(e) => setEditValues({ ...editValues, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              ) : (
                <div className={styles.infoValue}>{profile.fullName}</div>
              )}
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Display Name
              </div>
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  className={styles.editInput}
                  value={editValues.displayName}
                  onChange={(e) => setEditValues({ ...editValues, displayName: e.target.value })}
                  placeholder="Enter display name"
                />
              ) : (
                <div className={styles.infoValue}>{profile.displayName}</div>
              )}
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Role
              </div>
              <div className={styles.infoValue}>
                <span className={styles.roleBadge}>{profile.role || 'USER'}</span>
              </div>
            </div>

            {profile.createdAt && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Member Since
                </div>
                <div className={styles.infoValue}>
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Change Password</h2>
            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordValues.oldPassword}
                  onChange={(e) => setPasswordValues({ ...passwordValues, oldPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordValues.newPassword}
                  onChange={(e) => setPasswordValues({ ...passwordValues, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordValues.confirmPassword}
                  onChange={(e) => setPasswordValues({ ...passwordValues, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.saveButton} 
                  onClick={handleSavePassword}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Password'}
                </button>
                <button 
                  className={styles.cancelButton} 
                  onClick={handleCancelChangePassword}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
