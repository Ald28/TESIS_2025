import { useState } from "react";
import { FaUser } from "react-icons/fa";
import NotificationBell from "../Common/NotificationBell";
import PerfilSidebar from "../Admin/PerfilSidebar";

const Navbar = ({ collapsed }) => {
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  return (
    <>
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
        <a className="navbar-brand text-black mb-0 h5" href="/">
        </a>
        <div className="d-flex align-items-center gap-3">
          <NotificationBell />
          <button
            className="btn btn-link text-dark"
            onClick={() => setMostrarPerfil(true)}
          >
            <FaUser size={20} />
          </button>
        </div>
      </nav>

      <PerfilSidebar
        show={mostrarPerfil}
        onHide={() => setMostrarPerfil(false)}
      />
    </>
  );
};

export default Navbar;