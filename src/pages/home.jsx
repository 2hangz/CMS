import UploadBanner from "../components/uploadBanner";
import Navbar from "../components/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div>
        <h2>Manage Articles</h2>
        <UploadBanner />
      </div>
    </div>
  );
}