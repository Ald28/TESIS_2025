import React from "react";
import { Link, useLocation } from "react-router-dom";
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
import { logout } from "../../utils/logout";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const toggleSidebar = () => setCollapsed(!collapsed);
  const location = useLocation();

  const menuItems = [
    { to: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/admin/usuarios", icon: <FaUsers />, label: "Estudiantes" },
    { to: "/admin/cuestionarios", icon: <FaTasks />, label: "Cuestionarios" },
    { to: "/admin/metodos", icon: <FaClipboardList />, label: "Actividades" },
    { to: "/admin/citas", icon: <FaCalendarAlt />, label: "Citas" },
    { to: "/admin/notificaciones", icon: <FaBell />, label: "Notificaciones" },
  ];

  return (
    <div
      className="d-flex flex-column bg-primary text-white"
      style={{
        minHeight: "100vh",
        width: collapsed ? "80px" : "250px",
        transition: "width 0.3s ease",
        overflowX: "hidden",
        alignItems: "center",
        paddingTop: "1rem",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <div className="d-flex flex-column align-items-center w-100 pb-3">
        <img
          src="/icon.png"
          alt="Icono"
          style={{
            width: collapsed ? "40px" : "60px",
            height: collapsed ? "40px" : "60px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
        {!collapsed && <h5 className="mb-0 text-center">Psicólogo</h5>}
      </div>

      <ul className="nav flex-column mt-2 w-100">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.to;

          return (
            <li key={idx} className="nav-item mb-3">
              <Link
                to={item.to}
                className={`nav-link d-flex align-items-center ${isActive ? "bg-light text-primary fw-bold rounded-start" : "text-white"}`}
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: "8px",
                  paddingLeft: collapsed ? "0" : "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}

        <li className="nav-item mb-3">
          <button
            onClick={logout}
            className="nav-link d-flex align-items-center text-danger fw-bold w-100 border-0 bg-transparent"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "8px",
              paddingLeft: collapsed ? "0" : "1rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              cursor: "pointer",
            }}
          >
            <FaSignOutAlt />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </li>
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