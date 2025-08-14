
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
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
  }

  return (
    <nav className="cms-navbar">
      <h2 className="cms-navbar-logo">ENTYRE CMS</h2>
      <div className="cms-navbar-links">
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
            <span>Homepage</span>
            <span>{showHomepageSubmenu ? "▼" : "▶"}</span>
          </span>
        </span>
        {showHomepageSubmenu && (
          <div>
            <Link to="/upload-banner" className="cms-navbar-link">Upload Banner</Link>
            <Link to="/upload-markdown" className="cms-navbar-link">Upload Homepage Content</Link>
          </div>
        )}

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
            <span>Outputs</span>
            <span>{showOutputpageSubmenu ? "▼" : "▶"}</span>
          </span>
        </span>
        {showOutputpageSubmenu && (
          <div>
            <Link to="/upload-article" className="cms-navbar-link">Upload Article</Link>
            <Link to="/upload-video" className="cms-navbar-link">Upload Video</Link>
          </div>
        )}
        
        
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
            <span>Workflow</span>
            <span>{showWorkflowSubmenu ? "▼" : "▶"}</span>
          </span>
        </span>
        {showWorkflowSubmenu && (
          <div>
            <Link to="/upload-workflow" className="cms-navbar-link">Workflow</Link>
          </div>
        )}

        
        <button onClick={handleLogout} className="cms-navbar-logout">Logout</button>
      </div>


    </nav>
  );
}

export default Navbar;