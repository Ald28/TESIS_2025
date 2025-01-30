import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaTachometerAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa"; // Importa los íconos
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  // Función para alternar el estado del sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`d-flex flex-column vh-100 bg-primary text-white p-3 ${collapsed ? "collapsed" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: collapsed ? "80px" : "250px", // Ajusta el ancho dependiendo del estado
        transition: "width 0.3s", // Transición suave en el cambio de tamaño
        display: "flex",
        alignItems: "center", // Centra el contenido en el eje horizontal
      }}
    >
      {/* Contenedor del icono y título */}
      <div className="text-center w-100">
        {/* Icono centrado arriba del título */}
        <img
          src="/src/assets/images/icon.png" // Ruta correcta de la imagen /src\assets\images\icon.png
          alt="Icono"
          style={{
            width: collapsed ? "40px" : "60px", // Ajusta el tamaño según el estado
            height: collapsed ? "40px" : "60px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px", // Espacio entre el icono y el título
          }}
        />
        {/* Título que cambia al colapsar */}
        {!collapsed && <h3 className="mb-4">Administrador</h3>}
      </div>

      {/* Opciones del sidebar */}
      <ul className="nav flex-column w-100">
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
          <Link to="/admin/ajustes" className="nav-link text-white d-flex align-items-center">
            <FaCog />
            {!collapsed && <span className="ms-2">Ajustes</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/" className="nav-link text-white d-flex align-items-center">
            <FaSignOutAlt />
            {!collapsed && <span className="ms-2">Cerrar Sesión</span>}
          </Link>
        </li>
      </ul>

      {/* Botón para colapsar/expandir el sidebar */}
      <div
        className="d-flex justify-content-center align-items-center mt-auto w-100"
        style={{
          cursor: "pointer",
          padding: "10px",
          backgroundColor: "#2d3e50",
        }}
        onClick={toggleSidebar}
      >
        {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
      </div>
    </div>
  );
};

export default Sidebar;
