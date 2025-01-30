import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = ({ collapsed }) => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light shadow-sm"
      style={{
        position: "fixed",
        top: 0,
        left: collapsed ? "80px" : "250px",
        width: collapsed ? "calc(100% - 80px)" : "calc(100% - 250px)", 
        zIndex: 10
      }}
    >
      <div className="container-fluid">
        <a className="navbar-brand text-primary" href="/">
          AdminPanel
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/admin/perfil">
                Perfil
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/notifications">
                Notificaciones
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-danger" href="/">
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
