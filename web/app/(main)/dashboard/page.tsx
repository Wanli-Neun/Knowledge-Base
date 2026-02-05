'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from "./dashboard.module.scss";
import UserDashboardPage from './user-page';

type StatsDetail = {
  total: number;
  active: number;
  inactive: number;
};

type DashboardStats = {
  users: StatsDetail;
  projects: StatsDetail;
  documents: StatsDetail;
};

type TimeSeriesDataPoint = {
  date: string;
  count: number;
};

type TimeSeriesData = {
  users: TimeSeriesDataPoint[];
  projects: TimeSeriesDataPoint[];
  documents: TimeSeriesDataPoint[];
};

type UserProfile = {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  avaUrl: string;
  role: string;
};

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('[Dashboard] Fetching user profile...');
        const res = await fetch('/api/user/profile');
        console.log('[Dashboard] Profile response status:', res.status);
        if (res.ok) {
          const data: UserProfile = await res.json();
          console.log('[Dashboard] User profile:', data);
          setUserRole(data.role);
        } else {
          console.error('[Dashboard] Failed to fetch profile, status:', res.status);
          setError(true);
        }
      } catch (error) {
        console.error('[Dashboard] Failed to fetch user profile:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !userRole) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Failed to load dashboard. Please try refreshing the page.</p>
      </div>
    );
  }

  // Show user dashboard for regular users
  if (userRole !== 'ADMIN') {
    return <UserDashboardPage />;
  }

  // Admin dashboard component
  return <AdminDashboard />;
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0, inactive: 0 },
    projects: { total: 0, active: 0, inactive: 0 },
    documents: { total: 0, active: 0, inactive: 0 },
  });
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData>({
    users: [],
    projects: [],
    documents: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setTimeSeriesLoading(true);
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const [statsRes, timeSeriesRes] = await Promise.all([
        fetch(`/api/admin/stats${queryString}`),
        fetch(`/api/admin/stats/timeseries${queryString}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (timeSeriesRes.ok) {
        const data = await timeSeriesRes.json();
        setTimeSeries(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setTimeSeriesLoading(false);
    }
  };

  const clearFilter = async () => {
    setStartDate('');
    setEndDate('');
    setLoading(true);
    setTimeSeriesLoading(true);
    
    try {
      const [statsRes, timeSeriesRes] = await Promise.all([
        fetch(`/api/admin/stats`),
        fetch(`/api/admin/stats/timeseries`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (timeSeriesRes.ok) {
        const data = await timeSeriesRes.json();
        setTimeSeries(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setTimeSeriesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>System Overview & Statistics</p>
        </div>
        <div className={styles.filterContainer}>
          <button 
            className={styles.filterIconBtn}
            onClick={() => setShowFilter(!showFilter)}
            title="Filter by date"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
          {showFilter && (
            <div className={styles.filterPanel}>
              <div className={styles.dateFilter}>
                <label>
                  <span>From:</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </label>
                <label>
                  <span>To:</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </label>
                <button onClick={fetchData} className={styles.filterButton}>Apply</button>
                {(startDate || endDate) && (
                  <button 
                    onClick={clearFilter} 
                    className={styles.clearButton}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Users</h3>
            <p className={styles.statValue}>
              {loading ? '...' : stats.users.total.toLocaleString()}
            </p>
            <div className={styles.statDetails}>
              <div className={styles.statDetailItem}>
                <span className={styles.statDetailDot} style={{ backgroundColor: '#10b981' }}></span>
                <span className={styles.statDetailLabel}>Active:</span>
                <span className={styles.statDetailValue}>{loading ? '...' : stats.users.active.toLocaleString()}</span>
              </div>
              <div className={styles.statDetailItem}>
                <span className={styles.statDetailDot} style={{ backgroundColor: '#ef4444' }}></span>
                <span className={styles.statDetailLabel}>Inactive:</span>
                <span className={styles.statDetailValue}>{loading ? '...' : stats.users.inactive.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Projects</h3>
            <p className={styles.statValue}>
              {loading ? '...' : stats.projects.total.toLocaleString()}
            </p>
            <div className={styles.statDetails}>
              <div className={styles.statDetailItem}>
                <span className={styles.statDetailDot} style={{ backgroundColor: '#10b981' }}></span>
                <span className={styles.statDetailLabel}>Active:</span>
                <span className={styles.statDetailValue}>{loading ? '...' : stats.projects.active.toLocaleString()}</span>
              </div>
              <div className={styles.statDetailItem}>
                <span className={styles.statDetailDot} style={{ backgroundColor: '#ef4444' }}></span>
                <span className={styles.statDetailLabel}>Inactive:</span>
                <span className={styles.statDetailValue}>{loading ? '...' : stats.projects.inactive.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Documents</h3>
            <p className={styles.statValue}>
              {loading ? '...' : stats.documents.total.toLocaleString()}
            </p>
            <div className={styles.statDetails}>
              <div className={styles.statDetailItem}>
                <span className={styles.statDetailDot} style={{ backgroundColor: '#10b981' }}></span>
                <span className={styles.statDetailLabel}>Active:</span>
                <span className={styles.statDetailValue}>{loading ? '...' : stats.documents.active.toLocaleString()}</span>
              </div>
              <div className={styles.statDetailItem}>
                <span className={styles.statDetailDot} style={{ backgroundColor: '#ef4444' }}></span>
                <span className={styles.statDetailLabel}>Inactive:</span>
                <span className={styles.statDetailValue}>{loading ? '...' : stats.documents.inactive.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsSection}>
        <h2 className={styles.sectionTitle}>Growth Trends</h2>
        
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>New Users</h3>
            {timeSeriesLoading ? (
              <div className={styles.chartLoading}>Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries.users}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    name="New Users"
                    dot={false}
                    activeDot={{ r: 6, fill: '#667eea' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>New Projects</h3>
            {timeSeriesLoading ? (
              <div className={styles.chartLoading}>Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries.projects}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f5576c" 
                    strokeWidth={2}
                    name="New Projects"
                    dot={false}
                    activeDot={{ r: 6, fill: '#f5576c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Document Uploads</h3>
            {timeSeriesLoading ? (
              <div className={styles.chartLoading}>Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries.documents}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00f2fe" 
                    strokeWidth={2}
                    name="Documents Uploaded"
                    dot={false}
                    activeDot={{ r: 6, fill: '#00f2fe' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
