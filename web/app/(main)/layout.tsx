'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { setupAuthErrorHandler } from '@/lib/auth-utils';
import styles from './layout.module.scss';

type Project = {
  projectId: string;
  projectName: string;
  description: string;
  createdBy: string;
};

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [currentProjectPage, setCurrentProjectPage] = useState(0);
  const [totalProjectPages, setTotalProjectPages] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const projectPageSize = 5;

  const fetchProjects = async (page: number = 0) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects?page=${page}&size=${projectPageSize}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.content || []);
        setTotalProjectPages(data.totalPages || 0);
        setTotalProjects(data.totalElements || 0);
        setCurrentProjectPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Setup global auth error handler
    setupAuthErrorHandler();
    
    const fetchData = async () => {
      try {
        // Fetch projects và user profile song song
        const [projectsRes, profileRes] = await Promise.all([
          fetch(`/api/projects?page=0&size=${projectPageSize}`),
          fetch('/api/user/profile')
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.content || []);
          setTotalProjectPages(projectsData.totalPages || 0);
          setTotalProjects(projectsData.totalElements || 0);
          setCurrentProjectPage(0);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: newProject.name,
          description: newProject.description,
        }),
      });

      if (res.ok) {
        // Refresh projects list - quay về trang đầu
        await fetchProjects(0);
        
        // Reset and close modal
        setNewProject({ name: '', description: '' });
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
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
            <>
              <div className={styles.navSection}>
                <div className={styles.navHeader}>
                  <h3 className={styles.navTitle}>Projects</h3>
                  <button 
                    className={styles.addButton}
                    onClick={() => setIsCreateModalOpen(true)}
                    aria-label="Create new project"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                {loading ? (
                  <div className={styles.loading}>Loading...</div>
                ) : projects.length > 0 ? (
                  <>
                    <ul className={styles.projectList}>
                      {projects.map((project) => {
                        const isActive = pathname?.includes(`/projects/${project.projectId}`);
                        return (
                          <li key={project.projectId}>
                            <Link 
                              href={`/projects/${project.projectId}`}
                              className={`${styles.projectItem} ${isActive ? styles.active : ''}`}
                            >
                              <span className={styles.projectName}>{project.projectName}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {totalProjectPages > 1 && (
                      <div className={styles.projectPagination}>
                        <button 
                          className={styles.pageButton}
                          onClick={() => fetchProjects(currentProjectPage - 1)}
                          disabled={currentProjectPage === 0}
                          title="Previous page"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <div className={styles.pageInfo}>
                          <span className={styles.pageNumber}>{currentProjectPage + 1}/{totalProjectPages}</span>
                        </div>
                        <button 
                          className={styles.pageButton}
                          onClick={() => fetchProjects(currentProjectPage + 1)}
                          disabled={currentProjectPage >= totalProjectPages - 1}
                          title="Next page"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>No projects yet</div>
                )}
              </div>
            </>
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

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Project</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateProject} className={styles.modalForm}>
              <div className={styles.formField}>
                <label htmlFor="projectName">Project Name *</label>
                <input
                  id="projectName"
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                  autoFocus
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="projectDescription">Description</label>
                <textarea
                  id="projectDescription"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description (optional)"
                  rows={4}
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isCreating || !newProject.name.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
