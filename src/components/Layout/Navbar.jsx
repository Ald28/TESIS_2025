import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaBell, FaUser } from "react-icons/fa";

const Navbar = ({ collapsed }) => {
  return (
    <nav
      className="navbar navbar-light bg-light shadow-sm px-3"
      style={{
        position: "fixed",
        top: 0,
        left: collapsed ? "80px" : "250px",
        width: collapsed ? "calc(100% - 80px)" : "calc(100% - 250px)",
        zIndex: 10,
        height: "60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <a className="navbar-brand text-primary mb-0 h5" href="/">
        AdminPanel
      </a>

      <div className="d-flex align-items-center gap-3">
        <a className="text-dark" href="/admin/notificaciones">
          <FaBell size={20} />
        </a>
        <a className="text-dark" href="/admin/perfil">
          <FaUser size={20} />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;