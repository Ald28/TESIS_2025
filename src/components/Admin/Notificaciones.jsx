import { useEffect, useState } from 'react';
import {
  listarNotificacionesPorUsuario,
  eliminarNotificacionPorId,
} from '../Api/api_notificaciones';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaBell,
  FaTimesCircle,
  FaCheckCircle,
  FaUserAlt,
  FaCommentDots,
} from 'react-icons/fa';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleEliminar = async (id) => {
    const confirmar = await Swal.fire({
      title: '¿Eliminar notificación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmar.isConfirmed) return;

    try {
      await eliminarNotificacionPorId(id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notificación eliminada correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar notificación:', error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const getIconByTipo = (tipo) => {
    switch (tipo) {
      case 'completado':
        return <FaCheckCircle className="text-success me-3 align-self-center" size={26} />;
      case 'mensaje':
        return <FaCommentDots className="text-primary me-3 align-self-center" size={26} />;
      default:
        return <FaUserAlt className="text-secondary me-3 align-self-center" size={26} />;
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  return (
    <div className="container mt-4" style={{ maxWidth: '800px' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 className="text-center mb-4 d-flex align-items-center justify-content-center gap-2">
        <FaBell /> Notificaciones
      </h2>

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
        <ul className="list-group">
          {notificaciones.map((notif) => (
            <li
              key={notif.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              style={{ padding: '20px 24px' }}
            >
              <div className="d-flex align-items-center flex-grow-1">
                {getIconByTipo(notif.tipo)}
                <div>
                  <strong>{notif.titulo}</strong>
                  <p className="mb-1">{notif.mensaje}</p>
                  <small className="text-muted">
                    {new Date(notif.fecha_envio).toLocaleString()}
                  </small>
                </div>
              </div>

              <button
                className="btn btn-sm btn-outline-danger ms-4"
                onClick={() => handleEliminar(notif.id)}
                title="Eliminar notificación"
              >
                <FaTimesCircle size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}