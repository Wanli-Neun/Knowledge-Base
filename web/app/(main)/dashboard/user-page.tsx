'use client';

import { useState, useEffect } from 'react';
import styles from "./user-dashboard.module.scss";

type UserStats = {
  projectCount: number;
  documentCount: number;
};

type RecentDocument = {
  id: string;
  projectId: string;
  title: string;
  fileType: string;
  fileSize: number;
  updatedAt: string;
};

export default function UserDashboardPage() {
  const [stats, setStats] = useState<UserStats>({
    projectCount: 0,
    documentCount: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.log('[UserDashboard] Fetching user stats...');
        const response = await fetch('/api/user/stats');
        console.log('[UserDashboard] Stats response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[UserDashboard] Stats data:', data);
          setStats(data);
        } else {
          console.error('[UserDashboard] Failed to fetch user stats:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[UserDashboard] Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentDocuments = async () => {
      setDocumentsLoading(true);
      try {
        console.log('[UserDashboard] Fetching recent documents...');
        const response = await fetch('/api/user/recent-documents');
        console.log('[UserDashboard] Recent docs response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[UserDashboard] Recent docs data:', data);
          setRecentDocuments(data);
        } else {
          console.error('[UserDashboard] Failed to fetch recent documents:', response.status);
        }
      } catch (error) {
        console.error('[UserDashboard] Failed to fetch recent documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchStats();
    fetchRecentDocuments();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Personal statistics</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>My Projects</h3>
            <p className={styles.statValue}>
              {loading ? '...' : stats.projectCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>My Documents</h3>
            <p className={styles.statValue}>
              {loading ? '...' : stats.documentCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Documents</h2>
        <div className={styles.documentList}>
          {documentsLoading ? (
            <div className={styles.loadingState}>Loading...</div>
          ) : recentDocuments.length === 0 ? (
            <div className={styles.emptyState}>No recent documents</div>
          ) : (
            recentDocuments.map((doc) => (
              <div key={doc.id} className={styles.documentItem}>
                <div className={styles.docIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
                <div className={styles.docInfo}>
                  <h3 className={styles.docTitle}>{doc.title}</h3>
                  <div className={styles.docMeta}>
                    <span className={styles.docType}>{doc.fileType}</span>
                    <span className={styles.docSize}>{formatFileSize(doc.fileSize)}</span>
                    <span className={styles.docDate}>{formatDate(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
