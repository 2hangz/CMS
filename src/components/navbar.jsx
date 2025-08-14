import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHomepageSubmenu, setShowHomepageSubmenu] = useState(false);
  const [showOutputpageSubmenu, setShowOutputpageSubmenu] = useState(false);
  const [showWorkflowSubmenu, setShowWorkflowSubmenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleHomepageClick = () => {
    setShowHomepageSubmenu((show) => !show);
  };

  const handleOutputpageClick = () => {
    setShowOutputpageSubmenu((show) => !show);
  };

  const handleWorkflowClick = () => {
    setShowWorkflowSubmenu((show) => !show);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="cms-navbar">
      <div className="cms-navbar-logo">
        <div style={{ fontSize: '1.2em', marginBottom: '4px' }}>🏢</div>
        ENTYRE CMS
      </div>
      
      <div className="cms-navbar-links">
        {/* Homepage Section */}
        <div>
          <span
            className="cms-navbar-link cms-navbar-dropdown-title"
            onClick={handleHomepageClick}
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleHomepageClick();
            }}
          >
            <span className="cms-navbar-dropdown-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏠</span>
                <span>Homepage</span>
              </span>
              <span style={{ transition: 'transform 0.2s', transform: showHomepageSubmenu ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                ▶
              </span>
            </span>
          </span>
          {showHomepageSubmenu && (
            <div style={{ marginLeft: '20px', marginTop: '8px' }}>
              <Link 
                to="/upload-banner" 
                className={`cms-navbar-link ${isActive('/upload-banner') ? 'active' : ''}`}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                <span style={{ marginRight: '8px' }}>🖼️</span>
                Upload Banner
              </Link>
              <Link 
                to="/upload-markdown" 
                className={`cms-navbar-link ${isActive('/upload-markdown') ? 'active' : ''}`}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                <span style={{ marginRight: '8px' }}>📝</span>
                Homepage Content
              </Link>
            </div>
          )}
        </div>

        {/* Outputs Section */}
        <div>
          <span
            className="cms-navbar-link cms-navbar-dropdown-title"
            onClick={handleOutputpageClick}
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleOutputpageClick();
            }}
          >
            <span className="cms-navbar-dropdown-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📤</span>
                <span>Outputs</span>
              </span>
              <span style={{ transition: 'transform 0.2s', transform: showOutputpageSubmenu ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                ▶
              </span>
            </span>
          </span>
          {showOutputpageSubmenu && (
            <div style={{ marginLeft: '20px', marginTop: '8px' }}>
              <Link 
                to="/upload-article" 
                className={`cms-navbar-link ${isActive('/upload-article') ? 'active' : ''}`}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                <span style={{ marginRight: '8px' }}>📄</span>
                Upload Article
              </Link>
              <Link 
                to="/upload-video" 
                className={`cms-navbar-link ${isActive('/upload-video') ? 'active' : ''}`}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                <span style={{ marginRight: '8px' }}>🎬</span>
                Upload Video
              </Link>
            </div>
          )}
        </div>
        
        {/* Workflow Section */}
        <div>
          <span
            className="cms-navbar-link cms-navbar-dropdown-title"
            onClick={handleWorkflowClick}
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleWorkflowClick();
            }}
          >
            <span className="cms-navbar-dropdown-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span>
                <span>Workflow</span>
              </span>
              <span style={{ transition: 'transform 0.2s', transform: showWorkflowSubmenu ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                ▶
              </span>
            </span>
          </span>
          {showWorkflowSubmenu && (
            <div style={{ marginLeft: '20px', marginTop: '8px' }}>
              <Link 
                to="/upload-workflow" 
                className={`cms-navbar-link ${isActive('/upload-workflow') ? 'active' : ''}`}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                <span style={{ marginRight: '8px' }}>🔄</span>
                Manage Workflows
              </Link>
            </div>
          )}
        </div>
      </div>

      <button onClick={handleLogout} className="cms-navbar-logout">
        <span style={{ marginRight: '8px' }}>🚪</span>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;