import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaTimes,
  FaUser,
  FaCheckCircle,
  FaCommentDots,
} from "react-icons/fa";
import {
  listarNotificacionesPorUsuario,
  eliminarNotificacionPorId,
  revisarInactividadEstudiantes,
  notificarCitasProximas, // ✅ nuevo import
} from "../Api/api_notificaciones";
import "../Styles/NotificationBell.css";

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [nuevas, setNuevas] = useState(0);
  const notificacionesPrevias = useRef([]);
  const audioRef = useRef(null);

  const toggleDropdown = () => {
    setMostrar(!mostrar);
    if (!mostrar) {
      setNuevas(0);
    }
  };

  const cargarNotificaciones = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    try {
      const data = await listarNotificacionesPorUsuario(usuario.id);

      if (data.length > notificacionesPrevias.current.length) {
        const nuevasCantidad = data.length - notificacionesPrevias.current.length;
        setNuevas((prev) => prev + nuevasCantidad);
        audioRef.current?.play();
      }

      setNotificaciones(data);
      notificacionesPrevias.current = data;
    } catch (err) {
      console.error("❌ Error al listar notificaciones:", err);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarNotificacionPorId(id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar notificación:", error);
    }
  };

  useEffect(() => {
    cargarNotificaciones();

    const interval = setInterval(async () => {
      await cargarNotificaciones();

      try {
        const inactividad = await revisarInactividadEstudiantes();
        if (inactividad?.message) {
        }
      } catch (err) {
        console.error("❌ Error al revisar inactividad:", err);
      }

      try {
        const citas = await notificarCitasProximas();
        if (citas?.message) {
        }
      } catch (err) {
        console.error("❌ Error al notificar citas próximas:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getIconByTipo = (tipo) => {
    switch (tipo) {
      case "completado":
        return <FaCheckCircle className="notif-icon success" />;
      case "mensaje":
        return <FaCommentDots className="notif-icon info" />;
      default:
        return <FaUser className="notif-icon default" />;
    }
  };

  return (
    <div className="notification-bell">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="bell-wrapper" onClick={toggleDropdown}>
        <FaBell size={20} />
        {nuevas > 0 && <span className="notif-badge">{nuevas}</span>}
      </div>

      {mostrar && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notificaciones</span>
          </div>

          {notificaciones.length === 0 ? (
            <div className="notif-empty">Sin notificaciones</div>
          ) : (
            <>
              {notificaciones.map((n, index) => (
                <Link
                  to="/admin/dashboard"
                  key={n.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                  onClick={() => setMostrar(false)}
                >
                  <div className={`notif-item ${index < nuevas ? "new" : ""}`}>
                    {getIconByTipo(n.tipo)}
                    <div className="notif-content">
                      <strong>{n.titulo}</strong>
                      <div>{n.mensaje}</div>
                      <span className="notif-time">
                        {new Date(n.fecha_envio).toLocaleString()}
                      </span>
                    </div>
                    <FaTimes
                      className="notif-delete"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEliminar(n.id);
                      }}
                    />
                  </div>
                </Link>
              ))}

              <div className="notif-footer">
                <Link to="/admin/notificaciones">Ver todas las notificaciones</Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;