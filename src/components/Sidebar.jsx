import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserMd,
  FaUsers,
  FaCalendarAlt
} from "react-icons/fa";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className="d-flex flex-column justify-content-between align-items-center"
      style={{
        backgroundColor: "#0d6efd", // azul Bootstrap
        color: "#ffffff",
        width: collapsed ? "80px" : "240px",
        transition: "width 0.3s",
        height: "100vh",
      }}
    >
      {/* LOGO */}
      <div className="w-100 text-center py-3">
        <img
          src="/img/logo.png"
          alt="Logo"
          style={{
            width: collapsed ? "40px" : "80px",
            transition: "0.3s",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* NAV LINKS */}
      <Nav className="flex-column align-items-center w-100">
        <Nav.Link
          href="/dashboard"
          className="d-flex flex-column align-items-center py-3 text-white"
          style={{ fontSize: collapsed ? "12px" : "14px" }}
        >
          <FaHome size={20} />
          {!collapsed && <span className="mt-1">Dashboard</span>}
        </Nav.Link>
        <Nav.Link
          href="/psicologos"
          className="d-flex flex-column align-items-center py-3 text-white"
          style={{ fontSize: collapsed ? "12px" : "14px" }}
        >
          <FaUserMd size={20} />
          {!collapsed && <span className="mt-1">Psicólogos</span>}
        </Nav.Link>
        <Nav.Link
          href="/estudiantes"
          className="d-flex flex-column align-items-center py-3 text-white"
          style={{ fontSize: collapsed ? "12px" : "14px" }}
        >
          <FaUsers size={20} />
          {!collapsed && <span className="mt-1">Estudiantes</span>}
        </Nav.Link>
        <Nav.Link
          href="/disponibilidad"
          className="d-flex flex-column align-items-center py-3 text-white"
          style={{ fontSize: collapsed ? "12px" : "14px" }}
        >
          <FaCalendarAlt size={20} />
          {!collapsed && <span className="mt-1">Disponibilidad</span>}
        </Nav.Link>
      </Nav>

      {/* LOGOUT + TOGGLE */}
      <div className="w-100 text-center mb-3">
        <Nav.Link
          onClick={handleLogout}
          className="d-flex flex-column align-items-center text-danger fw-bold"
        >
          <FaSignOutAlt size={20} />
          {!collapsed && <span className="mt-1">Cerrar sesión</span>}
        </Nav.Link>
        <button
          onClick={toggleSidebar}
          className="btn mt-3"
          style={{
            width: collapsed ? "40px" : "90%",
            padding: "0.25rem",
            backgroundColor: "#004bb5",
            color: "#ffffff",
            border: "none",
          }}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;