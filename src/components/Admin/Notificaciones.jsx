import { useEffect, useState } from 'react';
import { listarNotificacionesPorUsuario } from '../Api/api_notificaciones';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (!usuario) return;
      try {
        const data = await listarNotificacionesPorUsuario(usuario.id);
        setNotificaciones(data);
      } catch (error) {
        console.error('❌ Error al obtener notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  return (
    <div>
      <h1 className="text-center">Notificaciones</h1>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center flex-column">
          <img
            src="/src/assets/images/icon.png"
            alt="Icono"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '10px',
            }}
          />
          <h5 className="mb-0 text-center">No tienes notificaciones</h5>
        </div>
      ) : (
        <div className="container mt-4">
          <ul className="list-group">
            {notificaciones.map((notif) => (
              <li key={notif.id} className="list-group-item">
                <strong>{notif.titulo}</strong>
                <p className="mb-0">{notif.mensaje}</p>
                <small className="text-muted">{new Date(notif.fecha_envio).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}