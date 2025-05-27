import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import {
  listarNotificacionesPorUsuario,
  eliminarNotificacionPorId,
} from "../Api/api_notificaciones";

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [nuevas, setNuevas] = useState(0);
  const notificacionesPrevias = useRef([]);
  const audioRef = useRef(null);

  const toggleDropdown = () => {
    setMostrar(!mostrar);
    if (!mostrar) setNuevas(0);
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
    const interval = setInterval(cargarNotificaciones, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div style={{ position: "relative", cursor: "pointer" }} onClick={toggleDropdown}>
        <FaBell size={20} />
        {nuevas > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "red",
              color: "white",
              fontSize: "10px",
              borderRadius: "50%",
              padding: "2px 5px",
              minWidth: "18px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {nuevas}
          </span>
        )}
      </div>

      {mostrar && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: 0,
            width: "300px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
            zIndex: 999,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "10px",
              fontWeight: "bold",
              borderBottom: "1px solid #eee",
            }}
          >
            Notificaciones
          </div>
          {notificaciones.length === 0 ? (
            <div style={{ padding: "10px", textAlign: "center" }}>
              Sin notificaciones
            </div>
          ) : (
            notificaciones.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  fontSize: "14px",
                  position: "relative",
                }}
              >
                <strong>{n.titulo}</strong>
                <div>{n.mensaje}</div>
                <div style={{ fontSize: "12px", color: "gray" }}>
                  {new Date(n.fecha_envio).toLocaleString()}
                </div>

                <button
                  onClick={() => handleEliminar(n.id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                  title="Eliminar notificación"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;