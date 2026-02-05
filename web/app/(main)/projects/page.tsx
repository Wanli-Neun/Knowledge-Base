'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './projects.module.scss';
import Toast from '@/app/components/Toast';

type Project = {
  projectId: string;
  projectName: string;
  description: string;
  createdBy: string;
  createdByDisplayName?: string;
  createdAt?: string;
};

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageSize = 9;

  const fetchProjects = async (page: number = 0, search: string = '') => {
    try {
      setLoading(true);
      let url = `/api/projects?page=${page}&size=${pageSize}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(0);
  }, []);

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      fetchProjects(0, query);
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

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
        const data = await res.json();
        console.log('Create project response:', data); // Debug log
        
        // api-helper already unwraps the response, so data is ProjectResponse directly
        const projectId = data.projectId;
        
        setNewProject({ name: '', description: '' });
        setIsCreateModalOpen(false);
        
        // Update project list before redirecting
        await fetchProjects(0, searchQuery);
        
        setToast({ message: 'Project created successfully!', type: 'success' });
        
        // Navigate to the new project after a short delay to show toast
        if (projectId) {
          setTimeout(() => {
            router.push(`/projects/${projectId}`);
          }, 500);
        }
      } else {
        setToast({ message: 'Failed to create project', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setToast({ message: 'Failed to create project', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className={styles.projectsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Projects</h1>
          <span className={styles.projectCount}>
            ({totalElements} {totalElements === 1 ? 'project' : 'projects'})
          </span>
        </div>
        <div className={styles.headerRight}>
          {isSearchOpen && (
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          )}
          <button
            className={styles.searchButton}
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) {
                setSearchQuery('');
                fetchProjects(0, '');
              }
            }}
            title="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className={styles.createButton}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Create Project</span>
          </button>
        </div>
      </div>

      <div className={styles.projectsContent}>
        {loading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : projects.length > 0 ? (
          <>
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className={styles.projectCard}
                  onClick={() => handleProjectClick(project.projectId)}
                >
                  <div className={styles.projectHeader}>
                    <h3 className={styles.projectName}>{project.projectName}</h3>
                  </div>
                  <p className={styles.projectDescription}>
                    {project.description || 'No description'}
                  </p>
                  <div className={styles.projectFooter}>
                    <div className={styles.projectMeta}>
                      <span className={styles.metaLabel}>Created by:</span>
                      <span className={styles.metaValue}>
                        {project.createdByDisplayName || project.createdBy}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => fetchProjects(currentPage - 1, searchQuery)}
                  disabled={currentPage === 0}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Previous</span>
                </button>
                <div className={styles.pageInfo}>
                  <span>
                    Page {currentPage + 1} of {totalPages}
                  </span>
                </div>
                <button
                  className={styles.pageButton}
                  onClick={() => fetchProjects(currentPage + 1, searchQuery)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <span>Next</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 2a1 1 0 000 2h6a1 1 0 100-2H9zM4 5a2 2 0 012-2h1a1 1 0 010 2H6v13h12V5h-1a1 1 0 010-2h1a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                fill="currentColor"
                opacity="0.3"
              />
            </svg>
            <h3>No projects found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first project to get started'}
            </p>
          </div>
        )}
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
                  <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
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
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
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
