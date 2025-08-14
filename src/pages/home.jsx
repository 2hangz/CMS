import Navbar from "../components/navbar";
import { useState, useEffect } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    articles: 0,
    videos: 0,
    banners: 0,
    workflows: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch statistics from all endpoints
    const fetchStats = async () => {
      try {
        const [articlesRes, videosRes, bannersRes, workflowsRes] = await Promise.all([
          fetch('https://entyre-backend.onrender.com/api/articles'),
          fetch('https://entyre-backend.onrender.com/api/videos'),
          fetch('https://entyre-backend.onrender.com/api/banners'),
          fetch('https://entyre-backend.onrender.com/api/workflow')
        ]);

        const [articles, videos, banners, workflows] = await Promise.all([
          articlesRes.json(),
          videosRes.json(),
          bannersRes.json(),
          workflowsRes.json()
        ]);

        setStats({
          articles: articles.length,
          videos: videos.length,
          banners: banners.length,
          workflows: workflows.length
        });

        // Combine recent items for activity feed
        const allItems = [
          ...articles.map(item => ({ ...item, type: 'article', icon: '' })),
          ...videos.map(item => ({ ...item, type: 'video', icon: '' })),
          ...banners.map(item => ({ ...item, type: 'banner', icon: '' })),
          ...workflows.map(item => ({ ...item, type: 'workflow', icon: '' }))
        ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
         .slice(0, 8);

        setRecentActivity(allItems);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Create Article',
      description: 'Write and publish new articles',
      icon: '',
      color: '#3b82f6',
      path: '/upload-article'
    },
    {
      title: 'Upload Video',
      description: 'Add videos to your library',
      icon: '',
      color: '#10b981',
      path: '/upload-video'
    },
    {
      title: 'Design Banner',
      description: 'Create homepage banners',
      icon: '',
      color: '#f59e0b',
      path: '/upload-banner'
    },
    {
      title: 'Build Workflow',
      description: 'Design interactive workflows',
      icon: '',
      color: '#8b5cf6',
      path: '/upload-workflow'
    },
    {
      title: 'Edit Homepage',
      description: 'Update homepage content',
      icon: '',
      color: '#06b6d4',
      path: '/upload-markdown'
    }
  ];

  return (
    <div className="cms-layout">
      <Navbar />
      <div className="cms-main-content">
        {/* Welcome Header */}
        <div className="page-header">
          <h1 className="page-title">Welcome to ENTYRE CMS</h1>
          <p className="page-subtitle">
            Manage your content, workflows, and digital assets from one unified dashboard
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          {[
            { label: 'Articles', value: stats.articles, icon: '', color: '#3b82f6' },
            { label: 'Videos', value: stats.videos, icon: '', color: '#10b981' },
            { label: 'Banners', value: stats.banners, icon: '', color: '#f59e0b' },
            { label: 'Workflows', value: stats.workflows, icon: '', color: '#8b5cf6' }
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="cms-card"
              style={{ 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div style={{ fontSize: '2.5em', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ 
                fontSize: '2em', 
                fontWeight: '700', 
                color: stat.color,
                marginBottom: '4px'
              }}>
                {loading ? '...' : stat.value}
              </div>
              <div style={{ fontSize: '0.9em', color: '#64748b', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Quick Actions */}
          <div className="cms-card">
            <div className="cms-card-header">
              <h3 className="cms-card-title">Quick Actions</h3>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '16px' 
            }}>
              {quickActions.map((action, idx) => (
                <a
                  key={idx}
                  href={action.path}
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = action.path;
                  }}
                >
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
                      border: `2px solid ${action.color}20`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      height: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 25px ${action.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      fontSize: '2em', 
                      marginBottom: '12px',
                      color: action.color 
                    }}>
                      {action.icon}
                    </div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '6px'
                    }}>
                      {action.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.9em', 
                      color: '#64748b',
                      lineHeight: '1.4'
                    }}>
                      {action.description}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="cms-card">
            <div className="cms-card-header">
              <h3 className="cms-card-title">Recent Activity</h3>
            </div>
            
            {loading ? (
              <div className="cms-loading">
                <div className="cms-spinner"></div>
                Loading activity...
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="cms-empty-state">
                <div style={{ fontSize: '2em', marginBottom: '12px' }}></div>
                <div>No recent activity</div>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {recentActivity.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8fafc';
                    }}
                  >
                    <div style={{ 
                      fontSize: '1.2em', 
                      marginRight: '12px',
                      minWidth: '24px'
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '0.9em',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        {item.title || item.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.8em', 
                        color: '#64748b',
                        textTransform: 'capitalize'
                      }}>
                        {item.type} • {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="cms-card" style={{ marginTop: '24px' }}>
          <div className="cms-card-header">
            <h3 className="cms-card-title">System Status</h3>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ 
              padding: '16px', 
              background: '#f0fdf4', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2em' }}></span>
                <span style={{ fontWeight: '600', color: '#166534' }}>API Status</span>
              </div>
              <div style={{ fontSize: '0.9em', color: '#15803d' }}>All systems operational</div>
            </div>
            
            <div style={{ 
              padding: '16px', 
              background: '#eff6ff', 
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2em' }}></span>
                <span style={{ fontWeight: '600', color: '#1d4ed8' }}>Storage</span>
              </div>
              <div style={{ fontSize: '0.9em', color: '#1e40af' }}>Cloudinary connected</div>
            </div>
            
            <div style={{ 
              padding: '16px', 
              background: '#fefce8', 
              borderRadius: '8px',
              border: '1px solid #fde047'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2em' }}></span>
                <span style={{ fontWeight: '600', color: '#a16207' }}>Last Sync</span>
              </div>
              <div style={{ fontSize: '0.9em', color: '#ca8a04' }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Help & Tips */}
        <div className="cms-card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
          <div className="cms-card-header">
            <h3 className="cms-card-title">Tips & Quick Start</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '1em' }}>
                Getting Started with Articles
              </h4>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9em', color: '#475569' }}>
                <li>Use compelling titles for better engagement</li>
                <li>Add summaries for social media previews</li>
                <li>Upload high-quality featured images</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '1em' }}>
                Workflow Best Practices
              </h4>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9em', color: '#475569' }}>
                <li>Start with basic info before adding nodes</li>
                <li>Use the preview panel to visualize layout</li>
                <li>Apply quick layouts for consistent positioning</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '1em' }}>
                Video Optimization
              </h4>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9em', color: '#475569' }}>
                <li>Upload custom thumbnails for better previews</li>
                <li>Use cloud storage for faster loading</li>
                <li>Keep video files under 100MB when possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}