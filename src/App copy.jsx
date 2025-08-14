import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import UploadArticle from "./components/uploadArticle";
import UploadVideo from "./components/uploadVideo";
import UploadBanner from "./components/uploadBanner";
import Home from "./pages/home";
import CMSContentEditor from "./components/uploadHomeContent";
import WorkflowCMS from "./components/workflow";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/upload-article" element={<UploadArticle />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/upload-markdown" element={<CMSContentEditor />} />
        <Route path="/upload-banner" element={<UploadBanner />} />
        <Route path="/upload-workflow" element={<WorkflowCMS />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;