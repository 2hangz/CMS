import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialState = (key) => {
    const value = localStorage.getItem(key);
    return value === "true" ? true : false;
  };

  const [showHomepageSubmenu, setShowHomepageSubmenu] = useState(() => getInitialState("showHomepageSubmenu"));
  const [showOutputpageSubmenu, setShowOutputpageSubmenu] = useState(() => getInitialState("showOutputpageSubmenu"));
  const [showWorkflowSubmenu, setShowWorkflowSubmenu] = useState(() => getInitialState("showWorkflowSubmenu"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem("showHomepageSubmenu", showHomepageSubmenu);
  }, [showHomepageSubmenu]);

  useEffect(() => {
    localStorage.setItem("showOutputpageSubmenu", showOutputpageSubmenu);
  }, [showOutputpageSubmenu]);

  useEffect(() => {
    localStorage.setItem("showWorkflowSubmenu", showWorkflowSubmenu);
  }, [showWorkflowSubmenu]);

  // Load user info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear menu state
    localStorage.removeItem("showHomepageSubmenu");
    localStorage.removeItem("showOutputpageSubmenu");
    localStorage.removeItem("showWorkflowSubmenu");
    
    // Navigate to login
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
        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
          ENTYRE CMS
        </Link>
      </div>
      
      <div className="cms-navbar-links">
        {/* Homepage Section */}
        <div className="cms-navbar-section">
          <div
            className="cms-navbar-dropdown-title"
            onClick={handleHomepageClick}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleHomepageClick();
            }}
          >
            <span className="cms-navbar-dropdown-header">
              <span>Homepage</span>
              <span className={`cms-navbar-arrow ${showHomepageSubmenu ? 'open' : ''}`}>
                ▶
              </span>
            </span>
          </div>
          
          <div className={`cms-navbar-submenu ${showHomepageSubmenu ? 'show' : ''}`}>
            <Link 
              to="/upload-banner" 
              className={`cms-navbar-sublink ${isActive('/upload-banner') ? 'active' : ''}`}
            >
              Upload Banner
            </Link>
            <Link 
              to="/upload-markdown" 
              className={`cms-navbar-sublink ${isActive('/upload-markdown') ? 'active' : ''}`}
            >
              Homepage Content
            </Link>
            <Link 
              to="/CMS" 
              className={`cms-navbar-sublink ${isActive('/CMS') ? 'active' : ''}`}
            >
              CMS
            </Link>
          </div>
        </div>
  
        {/* Outputs Section */}
        <div className="cms-navbar-section">
          <div
            className="cms-navbar-dropdown-title"
            onClick={handleOutputpageClick}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleOutputpageClick();
            }}
          >
            <span className="cms-navbar-dropdown-header">
              <span>Outputs</span>
              <span className={`cms-navbar-arrow ${showOutputpageSubmenu ? 'open' : ''}`}>
                ▶
              </span>
            </span>
          </div>
          
          <div className={`cms-navbar-submenu ${showOutputpageSubmenu ? 'show' : ''}`}>
            <Link 
              to="/upload-article" 
              className={`cms-navbar-sublink ${isActive('/upload-article') ? 'active' : ''}`}
            >
              Upload Article
            </Link>
            <Link 
              to="/upload-video" 
              className={`cms-navbar-sublink ${isActive('/upload-video') ? 'active' : ''}`}
            >
              Upload Video
            </Link>
          </div>
        </div>
        
        {/* Workflow Section */}
        <div className="cms-navbar-section">
          <div
            className="cms-navbar-dropdown-title"
            onClick={handleWorkflowClick}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") handleWorkflowClick();
            }}
          >
            <span className="cms-navbar-dropdown-header">
              <span>Workflow</span>
              <span className={`cms-navbar-arrow ${showWorkflowSubmenu ? 'open' : ''}`}>
                ▶
              </span>
            </span>
          </div>
          
          <div className={`cms-navbar-submenu ${showWorkflowSubmenu ? 'show' : ''}`}>
            <Link 
              to="/upload-workflow" 
              className={`cms-navbar-sublink ${isActive('/upload-workflow') ? 'active' : ''}`}
            >
              Manage Workflows
            </Link>
          </div>
        </div>
      </div>
  
      <div className="cms-navbar-user">
        {user && (
          <span className="cms-navbar-user-info">
            Welcome, {user.username}
            {user.demo && <span className="cms-navbar-demo-badge">DEMO</span>}
          </span>
        )}
        <button onClick={handleLogout} className="cms-navbar-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;