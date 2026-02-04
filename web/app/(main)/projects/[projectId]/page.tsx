'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './project.module.scss';
import Toast from '@/app/components/Toast';

type ProjectDetail = {
  projectId: string;
  projectName: string;
  description: string;
  createdBy: string;
  createdByDisplayName?: string;
  createdAt?: string;
};

type User = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
};

type Member = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
  joinedAt?: string;
};

type Document = {
  id: string;
  projectId: string;
  title: string;
  fileType: string;
  fileSize: number;
  downloadUrl?: string;
  uploadedBy: string;
  uploadedByDisplayName?: string;
};

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'members'>('documents');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [allMembers, setAllMembers] = useState<Member[]>([]); // Tất cả members để kiểm tra khi add
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const [totalUserPages, setTotalUserPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [openMemberMenu, setOpenMemberMenu] = useState<string | null>(null);
  const pageSize = 5;
  const userPageSize = 10;

  // Document states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [currentDocPage, setCurrentDocPage] = useState(0);
  const [totalDocPages, setTotalDocPages] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const docPageSize = 5;

  // Check URL query params for tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'members') {
      setActiveTab('members');
    }
  }, []);

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

  // Close member menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMemberMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest(`.${styles.memberItem}`)) {
          setOpenMemberMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMemberMenu]);

  // Fetch documents
  const fetchDocuments = async (page: number = 0) => {
    try {
      setDocumentsLoading(true);
      const res = await fetch(`/api/projects/${projectId}/documents?page=${page}&size=${docPageSize}`);
      if (res.ok) {
        const data = await res.json();
        const docData = data.result || data;
        setDocuments(docData.content || []);
        setTotalDocPages(docData.totalPages || 0);
        setTotalDocuments(docData.totalElements || 0);
        setCurrentDocPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setToast({ message: 'Không thể tải danh sách documents', type: 'error' });
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch documents when switching to documents tab
  useEffect(() => {
    if (activeTab === 'documents' && projectId) {
      fetchDocuments(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, projectId]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({ message: 'File quá lớn (tối đa 50MB)', type: 'error' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since fetch doesn't support progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        setToast({ message: `Đã upload "${file.name}" thành công`, type: 'success' });
        await fetchDocuments(currentDocPage); // Refresh documents list
        setIsUploadModalOpen(false); // Đóng modal
      } else {
        const error = await res.json();
        setToast({ message: error.message || 'Upload thất bại', type: 'error' });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setToast({ message: 'Có lỗi xảy ra khi upload', type: 'error' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsDragging(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle document download
  const handleDownload = async (documentId: string, title: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/documents/${documentId}`);
      if (res.ok) {
        const data = await res.json();
        const downloadUrl = data.result?.downloadUrl || data.downloadUrl;
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        }
      } else {
        setToast({ message: 'Không thể tạo link download', type: 'error' });
      }
    } catch (err) {
      console.error('Download failed:', err);
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${title}"?`)) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 204) {
        setToast({ message: `Đã xóa "${title}"`, type: 'success' });
        await fetchDocuments(currentDocPage);
      } else {
        const error = await res.json();
        setToast({ message: error.message || 'Xóa thất bại', type: 'error' });
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setToast({ message: 'Có lỗi xảy ra khi xóa', type: 'error' });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProject = async () => {
      try {
        console.log('[Client] Starting fetch for project:', projectId);
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: 'include',
        });
        
        if (cancelled) return;
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch project');
        }
        
        setProject(data);
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const fetchMembers = async (page: number = 0) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members?page=${page}&size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        console.log('[fetchMembers] Raw response:', data);
        console.log('[fetchMembers] Content:', data.content);
        let membersData = data.content || [];
        
        // Sort members: Owner first, then by role
        membersData = membersData.sort((a: Member, b: Member) => {
          // Check if either is the project creator (owner)
          const aIsOwner = project?.createdBy === a.userId;
          const bIsOwner = project?.createdBy === b.userId;
          
          if (aIsOwner && !bIsOwner) return -1;
          if (!aIsOwner && bIsOwner) return 1;
          
          // If both or neither are owner, sort by role
          if (a.role === 'OWNER' && b.role !== 'OWNER') return -1;
          if (a.role !== 'OWNER' && b.role === 'OWNER') return 1;
          
          return 0;
        });
        
        setMembers(membersData);
        setTotalPages(data.totalPages || 0);
        setTotalMembers(data.totalElements || 0);
        setCurrentPage(page);
        return membersData; // Return data for immediate use
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
    return []; // Return empty array on error
  };

  // Fetch members when tab changes
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(0); // Reset to first page when switching to members tab
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, projectId]);

  // Fetch users with pagination
  const fetchUsers = async (page: number = 0) => {
    try {
      const res = await fetch(`/api/users?page=${page}&size=${userPageSize}`);
      if (res.ok) {
        const data = await res.json();
        console.log('[fetchUsers] Response:', data);
        setAllUsers(data.content || []);
        setTotalUserPages(data.totalPages || 0);
        setTotalUsers(data.totalElements || 0);
        setCurrentUserPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch all users when opening modal
  const handleOpenAddMemberModal = async () => {
    setIsAddMemberModalOpen(true);
    try {
      // Fetch ALL members (không phân trang) để có danh sách đầy đủ
      console.log('[Modal] Fetching all members...');
      const membersRes = await fetch(`/api/projects/${projectId}/members?page=0&size=1000`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const allMembersData = membersData.content || [];
        setAllMembers(allMembersData);
        console.log('[Modal] All members:', allMembersData);
      }
      
      // Fetch users with pagination
      console.log('[Modal] Fetching users with pagination...');
      await fetchUsers(0); // Start from first page
    } catch (err) {
      console.error('[Modal] Error:', err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    
    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (res.ok) {
        console.log('Member added successfully');
        
        // Get user display name for notification
        const addedUser = allUsers.find(u => u.userId === selectedUserId);
        const displayName = addedUser?.displayName || 'Member';
        
        setToast({ message: `Đã thêm ${displayName} vào project`, type: 'success' });
        
        // Refresh members list
        await fetchMembers();
        
        setIsAddMemberModalOpen(false);
        setSelectedUserId(null);
      } else {
        const error = await res.json();
        console.error('Failed to add member:', error);
        setToast({ message: error.message || 'Không thể thêm member', type: 'error' });
      }
    } catch (err) {
      console.error('Failed to add member:', err);
      setToast({ message: 'Có lỗi xảy ra khi thêm member', type: 'error' });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, displayName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${displayName} khỏi project?`)) {
      return;
    }
    
    setOpenMemberMenu(null);
    
    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        console.log('Member removed successfully');
        setToast({ message: `Đã xóa ${displayName} khỏi project`, type: 'success' });
        // Refresh members list
        await fetchMembers();
      } else {
        const error = await res.json();
        console.error('Failed to remove member:', error);
        setToast({ message: error.message || 'Không thể xóa member', type: 'error' });
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      setToast({ message: 'Có lỗi xảy ra khi xóa member', type: 'error' });
    }
  };

  const handleViewProfile = (userId: string) => {
    console.log('[handleViewProfile] userId:', userId);
    console.log('[handleViewProfile] userId type:', typeof userId);
    console.log('[handleViewProfile] Navigating to:', `/profile/${userId}`);
    setOpenMemberMenu(null);
    
    // Save projectId to sessionStorage so we can navigate back to this project's members tab
    sessionStorage.setItem('returnToProject', projectId);
    
    // Navigate to profile page
    window.location.href = `/profile/${userId}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2>Failed to Load Project</h2>
          <p>{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.projectInfo}>
          <h1 className={styles.projectName}>{project.projectName}</h1>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
        </div>
      </div>

      {/* Created By */}
      <div className={styles.meta}>
        <span className={styles.metaLabel}>Created by</span>
        <div className={styles.creator}>
          <div className={styles.creatorAvatar}>
            {project.createdByDisplayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className={styles.creatorName}>
            {project.createdByDisplayName || project.createdBy}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {/* Tab Headers */}
        <div className={styles.tabHeaders}>
          <button
            className={`${styles.tabHeader} ${activeTab === 'documents' ? styles.active : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Documents
          </button>
          <button
            className={`${styles.tabHeader} ${activeTab === 'members' ? styles.active : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Members
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'documents' && (
            <div className={styles.documentsTab}>
              <div className={styles.tabHeader}>
                <h2>Documents</h2>
                <button 
                  className={styles.uploadButton}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload Document
                </button>
              </div>

              {/* Document List */}
              <div className={styles.documentList}>
                {documentsLoading ? (
                  <div className={styles.loading}>Loading documents...</div>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className={styles.documentItem}>
                      <div className={styles.documentIcon}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className={styles.documentInfo}>
                        <h4 className={styles.documentTitle}>{doc.title}</h4>
                        <p className={styles.documentMeta}>
                          {formatFileSize(doc.fileSize)} • Uploaded by {doc.uploadedByDisplayName || 'Unknown'}
                        </p>
                      </div>
                      <div className={styles.documentActions}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleDownload(doc.id, doc.title)}
                          title="Download"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5m0 0l5-5m-5 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {currentUser?.userId === project?.createdBy && (
                          <button 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            title="Delete"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>No documents yet</h3>
                    <p>Upload your first document to get started</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalDocPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageButton}
                    onClick={() => fetchDocuments(currentDocPage - 1)}
                    disabled={currentDocPage === 0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Previous
                  </button>
                  
                  <div className={styles.pageInfo}>
                    {currentDocPage + 1} of {totalDocPages}
                    <span className={styles.totalItems}>({totalDocuments} documents)</span>
                  </div>
                  
                  <button 
                    className={styles.pageButton}
                    onClick={() => fetchDocuments(currentDocPage + 1)}
                    disabled={currentDocPage >= totalDocPages - 1}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className={styles.membersTab}>
              <div className={styles.tabHeader}>
                <h2>Members</h2>
                {currentUser?.userId === project.createdBy && (
                  <button className={styles.addButton} onClick={handleOpenAddMemberModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Member
                  </button>
                )}
              </div>
              
              <div className={styles.memberList}>
                {members.length === 0 ? (
                  <div key="empty-members" className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>No members yet</h3>
                    <p>Add your first member to collaborate</p>
                  </div>
                ) : (
                  members.map((member, index) => {
                    const isCreator = currentUser?.userId === project.createdBy;
                    const canDelete = isCreator && member.userId !== project.createdBy;
                    const isMenuOpen = openMemberMenu === member.userId;
                    
                    return (
                      <div key={member.userId || member.email || `member-${index}`} className={styles.memberItem}>
                        <div 
                          className={styles.memberClickable}
                          onClick={() => setOpenMemberMenu(isMenuOpen ? null : member.userId)}
                        >
                          <div className={styles.memberAvatar}>
                            {member.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className={styles.memberInfo}>
                            <div className={styles.memberName}>
                              {member.displayName}
                            </div>
                            <div className={styles.memberEmail}>
                              {member.email}
                            </div>
                          </div>
                          <div className={`${styles.memberBadge} ${member.userId === project.createdBy ? styles.owner : styles.member}`}>
                            {member.userId === project.createdBy ? 'Owner' : 'Member'}
                          </div>
                        </div>
                        
                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className={styles.memberMenu}>
                            <button 
                              className={styles.menuItem}
                              onClick={() => handleViewProfile(member.userId)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Profile
                            </button>
                            {canDelete && (
                              <button 
                                className={`${styles.menuItem} ${styles.danger}`}
                                onClick={() => handleRemoveMember(member.userId, member.displayName)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    className={styles.pageButton}
                    onClick={() => fetchMembers(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Previous
                  </button>
                  
                  <div className={styles.pageInfo}>
                    {currentPage + 1} of {totalPages}
                    <span className={styles.totalItems}>({totalMembers} members)</span>
                  </div>
                  
                  <button 
                    className={styles.pageButton}
                    onClick={() => fetchMembers(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddMemberModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add Member</h3>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setIsAddMemberModalOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>Select a user to add to this project</p>
              
              <div className={styles.userList}>
                {allUsers.length === 0 ? (
                  <div className={styles.emptyUsers}>
                    <p>No users available</p>
                  </div>
                ) : (
                  allUsers.map((user) => {
                    const isAlreadyMember = allMembers.some(m => m.userId === user.userId);
                    console.log(`[Modal] Checking user ${user.userId} (${user.displayName}):`, {
                      isAlreadyMember,
                      memberUserIds: allMembers.map(m => m.userId),
                      userUserId: user.userId
                    });
                    return (
                      <div
                        key={user.userId}
                        className={`${styles.userItem} ${selectedUserId === user.userId ? styles.selected : ''} ${isAlreadyMember ? styles.disabled : ''}`}
                        onClick={() => {
                          if (!isAlreadyMember) {
                            setSelectedUserId(user.userId);
                          }
                        }}
                        style={isAlreadyMember ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                      >
                        <div className={styles.userAvatar}>
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>
                            {user.displayName}
                            {isAlreadyMember && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>(Already member)</span>}
                          </div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                        {selectedUserId === user.userId && !isAlreadyMember && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.checkIcon}>
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* User Pagination */}
              {totalUserPages > 1 && (
                <div className={styles.modalPagination}>
                  <button 
                    className={styles.modalPageButton}
                    onClick={() => fetchUsers(currentUserPage - 1)}
                    disabled={currentUserPage === 0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className={styles.modalPageInfo}>
                    {currentUserPage + 1} / {totalUserPages}
                  </div>
                  
                  <button 
                    className={styles.modalPageButton}
                    onClick={() => fetchUsers(currentUserPage + 1)}
                    disabled={currentUserPage >= totalUserPages - 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedUserId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleAddMember}
                disabled={!selectedUserId || isAddingMember}
              >
                {isAddingMember ? 'Adding...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !isUploading && setIsUploadModalOpen(false)}>
          <div className={styles.uploadModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Upload Document</h3>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div 
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${isUploading ? styles.uploading : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileInput"
                  className={styles.fileInput}
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className={styles.uploadingState}>
                    <div className={styles.spinner}></div>
                    <p>Uploading... {uploadProgress}%</p>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className={styles.uploadIcon}>
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>Drop files here or click to browse</h3>
                    <p>Maximum file size: 50MB</p>
                    <label htmlFor="fileInput" className={styles.browseButton}>
                      Choose File
                    </label>
                  </>
                )}
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
