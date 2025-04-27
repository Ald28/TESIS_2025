import { Outlet } from "react-router-dom";
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import React, { useState } from 'react';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar fijo a la izquierda */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenido principal */}
      <div
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white", // ⬅️ Esto hace fondo blanco
          minHeight: "100vh",        // ⬅️ Siempre ocupa toda la altura
        }}
      >
        {/* Navbar */}
        <Navbar collapsed={collapsed} />

        {/* Área de páginas */}
        <div style={{ marginTop: "60px", padding: "20px", flexGrow: 1 }}>
          <Outlet /> {/* Aquí se inyecta Dashboard, Usuarios, etc */}
        </div>
      </div>
    </div>
  );
}
