import React, { useState } from 'react';
import Sidebar from './Sidebar'; // Asumiendo que tienes el Sidebar
import Navbar from './Navbar';   // Asumiendo que tienes el Navbar

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);  // Estado para controlar si el sidebar está colapsado

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar - Estilo para que quede fijo a la izquierda */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenido principal */}
      <div
        style={{
          marginLeft: collapsed ? "80px" : "250px",  // Cambia el margen según si el sidebar está colapsado
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Navbar - Estilo para que ocupe todo el ancho de la página */}
        <Navbar collapsed={collapsed} />

        {/* Contenido de la página */}
        <div style={{ marginTop: "60px", padding: "20px", flexGrow: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}