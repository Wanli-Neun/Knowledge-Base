'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { setupAuthErrorHandler } from '@/lib/auth-utils';
import styles from './layout.module.scss';

type UserProfile = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();



  useEffect(() => {
    // Setup global auth error handler
    setupAuthErrorHandler();
    
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };



  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.brand}>
          {isSidebarOpen && <span>Knowledge Base</span>}
        </div>
        <nav className={styles.nav}>
          {isSidebarOpen && (
            <Link 
              href="/projects" 
              className={`${styles.navLink} ${pathname?.startsWith('/projects') ? styles.active : ''}`}
            >
              <span className={styles.navLinkText}>PROJECTS</span>
            </Link>
          )}
        </nav>
      </aside>

      <div className={`${styles.main} ${!isSidebarOpen ? styles.expanded : ''}`}>
        <header className={styles.header}>
          <button 
            className={styles.toggleBtn}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M3 5h14M3 10h14M3 15h14" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </button>
          
          {/* User Profile Section */}
          <div className={styles.userSection} ref={dropdownRef}>
            {user ? (
              <>
                <div className={styles.userInfo}>
                  <span className={styles.displayName}>{user.displayName || user.email}</span>
                </div>
                <div 
                  className={styles.avatar}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.avaUrl ? (
                    <img src={user.avaUrl} alt={user.displayName} />
                  ) : (
                    <span>{(user.displayName || user.email).charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link 
                      href={`/profile/${user.userId}`}
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM8 10c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" fill="currentColor"/>
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button 
                      className={styles.dropdownItem}
                      onClick={handleSignOut}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.userSkeleton}>Loading...</div>
            )}
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
