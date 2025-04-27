import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaTachometerAlt,
  FaTasks,
  FaUsers,
  FaWpforms,
  FaCog,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className="d-flex flex-column bg-primary text-white"
      style={{
        height: "100vh",
        width: collapsed ? "80px" : "250px",
        position: "fixed",
        top: 0,
        left: 0,
        transition: "width 0.3s ease",
        overflowX: "hidden", // 🔥 evita barras de desplazamiento
      }}
    >
      {/* Icono y Título */}
      <div className="text-center py-4">
        <img
          src="/src/assets/images/icon.png"
          alt="Icono"
          style={{
            width: collapsed ? "40px" : "60px",
            height: collapsed ? "40px" : "60px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
        {!collapsed && <h5 className="mb-0">Administrador</h5>}
      </div>

      {/* Menú de navegación */}
      <ul className="nav flex-column mt-3">
        <li className="nav-item mb-3">
          <Link to="/admin/dashboard" className="nav-link text-white d-flex align-items-center">
            <FaTachometerAlt />
            {!collapsed && <span className="ms-2">Dashboard</span>}
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link to="/admin/usuarios" className="nav-link text-white d-flex align-items-center">
            <FaUsers />
            {!collapsed && <span className="ms-2">Usuarios</span>}
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link to="/admin/cuestionarios" className="nav-link text-white d-flex align-items-center">
            <FaTasks />
            {!collapsed && <span className="ms-2">Cuestionarios</span>}
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link to="/admin/metodos" className="nav-link text-white d-flex align-items-center">
            <FaClipboardList />
            {!collapsed && <span className="ms-2">Métodos</span>}
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link to="/admin/citas" className="nav-link text-white d-flex align-items-center">
            <FaClipboardList />
            {!collapsed && <span className="ms-2">Citas</span>}
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link to="/admin/ajustes" className="nav-link text-white d-flex align-items-center">
            <FaCog />
            {!collapsed && <span className="ms-2">Ajustes</span>}
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link to="/" className="nav-link text-white d-flex align-items-center">
            <FaSignOutAlt />
            {!collapsed && <span className="ms-2">Cerrar Sesión</span>}
          </Link>
        </li>
      </ul>

      {/* Botón de colapso - SIEMPRE al fondo */}
      <div
        className="mt-auto d-flex justify-content-center align-items-center p-3"
        style={{ cursor: "pointer", backgroundColor: "#004bb5" }}
        onClick={toggleSidebar}
      >
        {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
      </div>
    </div>
  );
};

export default Sidebar;