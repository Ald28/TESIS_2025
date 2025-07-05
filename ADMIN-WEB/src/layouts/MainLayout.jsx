import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex" style={{ height: "100vh", width: "100vw" }}>
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <Navbar />
        <main className="p-4 flex-grow-1 bg-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;