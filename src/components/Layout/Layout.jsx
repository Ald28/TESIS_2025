import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React, { useState } from "react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingLeft: collapsed ? "100px" : "260px",
          transition: "padding 0.3s ease",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Navbar collapsed={collapsed} />
        
        <div style={{ marginTop: "60px", padding: "20px", flexGrow: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}