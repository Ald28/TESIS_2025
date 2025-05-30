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
  FaCalendarAlt,
  FaBell,
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
        minHeight: "100vh",
        height: "100%",
        width: collapsed ? "80px" : "250px",
        position: "fixed",
        top: 0,
        left: 0,
        transition: "width 0.3s ease",
        overflowX: "hidden",
        alignItems: "center",
        paddingTop: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          paddingBottom: "1rem",
        }}
      >
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
        {!collapsed && (
          <h5 className="mb-0 text-center">Psicólogo</h5>
        )}
      </div>

      <ul className="nav flex-column mt-2 w-100">
        {[
          { to: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
          { to: "/admin/usuarios", icon: <FaUsers />, label: "Estudiantes" },
          { to: "/admin/cuestionarios", icon: <FaTasks />, label: "Cuestionarios" },
          { to: "/admin/metodos", icon: <FaClipboardList />, label: "Actividades" },
          { to: "/admin/citas", icon: <FaCalendarAlt />, label: "Citas" },
          { to: "/admin/notificaciones", icon: <FaBell />, label: "Notificaciones" },
          { to: "/", icon: <FaSignOutAlt />, label: "Cerrar Sesión" },
        ].map((item, idx) => (
          <li key={idx} className="nav-item mb-3">
            <Link
              to={item.to}
              className="nav-link text-white d-flex align-items-center"
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "8px",
                paddingLeft: collapsed ? "0" : "1rem",
              }}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <div
        className="mt-auto d-flex justify-content-center align-items-center p-3 w-100"
        style={{ cursor: "pointer", backgroundColor: "#004bb5" }}
        onClick={toggleSidebar}
      >
        {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
      </div>
    </div>
  );
};

export default Sidebar;