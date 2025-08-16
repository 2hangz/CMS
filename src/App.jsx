import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import UploadArticle from "./components/uploadArticle";
import UploadVideo from "./components/uploadVideo";
import UploadBanner from "./components/uploadBanner";
import Home from "./pages/home";
import CMSContentEditor from "./components/uploadHomeContent";
import HomeContentSeeder from "./components/HomeContentSeeder"; // New component
import WorkflowCMS from "./components/workflow";

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-article" 
            element={
              <ProtectedRoute>
                <UploadArticle />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-video" 
            element={
              <ProtectedRoute>
                <UploadVideo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-markdown" 
            element={
              <ProtectedRoute>
                <CMSContentEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seed-home-content" 
            element={
              <ProtectedRoute>
                <HomeContentSeeder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-banner" 
            element={
              <ProtectedRoute>
                <UploadBanner />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-workflow" 
            element={
              <ProtectedRoute>
                <WorkflowCMS />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;