import { Outlet } from "react-router-dom";

import PublicNavbar from "./PublicNavbar.jsx";
import Footer from "./Footer.jsx";
import PublicMessageBox from "./PublicMessageBox.jsx";

export default function PublicLayout() {
  return (
    <div className="public-app">
      <PublicNavbar />
      <Outlet />
      <Footer />
      <PublicMessageBox />
    </div>
  );
}

