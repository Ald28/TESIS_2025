import React, { useEffect, useState, useRef } from "react";
import { listarEstudiantesRelacionados } from "../Api/api_citas";
import {
  buscarPsicologoPorUsuarioId,
  obtenerHistorial,
} from "../Api/api_psicologo";
import {
  crearCalificacion,
  obtenerCalificacionesPorEstudiante,
  editarCalificacion,
  eliminarCalificacion,
} from "../Api/api_observacion";
import { FaUserGraduate } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/Usuarios.css";

export default function Usuarios() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [historiales, setHistoriales] = useState({});
  const [psicologoId, setPsicologoId] = useState(null);
  const [modalEstudianteId, setModalEstudianteId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [modalHistorialEstudianteId, setModalHistorialEstudianteId] = useState(null);
  const [editandoComentarioId, setEditandoComentarioId] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [filtroComentarios, setFiltroComentarios] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const inputFechaRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("usuario"));
        if (!userData) return;

        const { psicologo_id } = await buscarPsicologoPorUsuarioId(userData.id);
        setPsicologoId(psicologo_id);

        const data = await listarEstudiantesRelacionados(psicologo_id);
        setEstudiantes(data);

        for (const est of data) {
          const obs = await obtenerCalificacionesPorEstudiante(est.estudiante_id);
          setObservaciones(prev => ({ ...prev, [est.estudiante_id]: obs }));

          const historial = await obtenerHistorial(est.estudiante_id);
          setHistoriales(prev => ({ ...prev, [est.estudiante_id]: historial }));
        }
      } catch (error) {
        toast.error("Error al cargar los datos");
        console.error("❌ Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const abrirModalObservaciones = (estudianteId) => {
    setModalEstudianteId(estudianteId);
    setModalVisible(true);
  };

  const abrirModalHistorial = (estudianteId) => {
    setModalHistorialEstudianteId(estudianteId);
    setModalHistorialVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setModalEstudianteId(null);
  };

  const cerrarModalHistorial = () => {
    setModalHistorialVisible(false);
    setModalHistorialEstudianteId(null);
  };

  const handleComentarioChange = (id, texto) => {
    setComentarios(prev => ({ ...prev, [id]: texto }));
  };

  const handleEnviarComentario = async (estudiante_id) => {
    const comentario = comentarios[estudiante_id];
    if (!comentario || comentario.trim() === "") {
      toast.warn("Escribe un comentario antes de enviarlo");
      return;
    }

    try {
      await crearCalificacion({ psicologo_id: psicologoId, estudiante_id, comentario });
      const nuevasObservaciones = await obtenerCalificacionesPorEstudiante(estudiante_id);
      setObservaciones(prev => ({ ...prev, [estudiante_id]: nuevasObservaciones }));
      setComentarios(prev => ({ ...prev, [estudiante_id]: "" }));
      toast.success("Comentario enviado correctamente");
    } catch (error) {
      console.error("❌ Error al enviar comentario:", error);
      toast.error("No se pudo enviar el comentario");
    }
  };

  const handleEditarComentario = (calificacionId, texto) => {
    setEditandoComentarioId(calificacionId);
    setNuevoComentario(texto);
  };

  const handleGuardarComentarioEditado = async (calificacionId, estudianteId) => {
    try {
      await editarCalificacion(calificacionId, { comentario: nuevoComentario, psicologo_id: psicologoId });
      const nuevasObservaciones = await obtenerCalificacionesPorEstudiante(estudianteId);
      setObservaciones(prev => ({ ...prev, [estudianteId]: nuevasObservaciones }));
      setEditandoComentarioId(null);
      setNuevoComentario("");
      toast.success("Comentario actualizado correctamente");
    } catch (error) {
      console.error("❌ Error al editar comentario:", error);
      toast.error("No se pudo editar el comentario");
    }
  };

  const handleEliminarComentario = async (calificacionId, estudianteId) => {
    const confirmar = await Swal.fire({
      title: '¿Eliminar comentario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmar.isConfirmed) return;

    try {
      await eliminarCalificacion(calificacionId, psicologoId);
      const nuevasObservaciones = await obtenerCalificacionesPorEstudiante(estudianteId);
      setObservaciones(prev => ({ ...prev, [estudianteId]: nuevasObservaciones }));
      toast.success("Comentario eliminado correctamente");
    } catch (error) {
      console.error("❌ Error al eliminar comentario:", error);
      toast.error("No se pudo eliminar el comentario");
    }
  };

  const observacionesFiltradas = (observaciones[modalEstudianteId] || [])
    .filter((obs) => {
      if (filtroComentarios === "mis") {
        return parseInt(obs.psicologo_id) === parseInt(psicologoId);
      }
      return true;
    })
    .filter((obs) => {
      if (!filtroFecha) return true;

      const fechaObs = new Date(obs.fecha_creacion).toISOString().split("T")[0];
      return fechaObs === filtroFecha;
    });

  return (
    <div className="estudiantes-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h1 className="mb-4 fw-bold text-primary d-flex align-items-center justify-content-center gap-2">
        <FaUserGraduate size={28} />
        Panel de Estudiantes
      </h1>

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Ciclo</th>
              <th>Nacimiento</th>
              <th>Carrera</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length > 0 ? (
              estudiantes.map((est) => (
                <tr key={est.estudiante_id}>
                  <td className="user-info">
                    <div className="avatar">
                      {est.foto_estudiante ? (
                        <img
                          src={est.foto_estudiante}
                          alt="Foto Estudiante"
                          className="avatar-image"
                        />
                      ) : (
                        <FaUserGraduate size={24} className="avatar-icon" />
                      )}
                    </div>
                    <div>
                      <div className="name">{est.nombre} {est.apellido}</div>
                      <div className="email">{est.correo}</div>
                    </div>
                  </td>
                  <td>{est.ciclo || "-"}</td>
                  <td>{est.fecha_nacimiento || "-"}</td>
                  <td>{est.carrera || "-"}</td>
                  <td>
                    <div className="comentario-container d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => abrirModalObservaciones(est.estudiante_id)}
                      >
                        Comentario
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => abrirModalHistorial(est.estudiante_id)}
                      >
                        Ver historial
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No hay estudiantes asignados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content shadow-lg rounded-3 p-4 bg-white" style={{ maxWidth: '700px', margin: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold">
                <i className="fas fa-comment-dots me-2 text-primary"></i> Observaciones del Estudiante
              </h4>
              <button className="btn btn-outline-secondary btn-sm" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <div className="d-flex gap-3 flex-wrap mb-4">
              <div style={{ maxWidth: "220px" }}>
                <select
                  className="form-select"
                  value={filtroComentarios}
                  onChange={(e) => setFiltroComentarios(e.target.value)}
                >
                  <option value="todos">Todos los comentarios</option>
                  <option value="mis">Mis comentarios</option>
                </select>
              </div>

              <div className="input-group" style={{ maxWidth: "200px" }}>
                <span
                  className="input-group-text bg-white"
                  style={{ cursor: "pointer" }}
                  onClick={() => inputFechaRef.current?.showPicker?.()}
                  title="Seleccionar fecha"
                >
                  <i className="fas fa-calendar-alt text-muted"></i>
                </span>
                <input
                  ref={inputFechaRef}
                  type="date"
                  className="form-control"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>

            </div>

            <div className="mb-3">
              <textarea
                className="form-control"
                placeholder="Escribe una nueva observación sobre el estudiante..."
                rows={3}
                maxLength={500}
                value={comentarios[modalEstudianteId] || ""}
                onChange={(e) => handleComentarioChange(modalEstudianteId, e.target.value)}
              />
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">0/500 caracteres</small>
                <button
                  className="btn btn-success"
                  onClick={() => handleEnviarComentario(modalEstudianteId)}
                >
                  <i className="fas fa-paper-plane me-1"></i> Enviar Comentario
                </button>
              </div>
            </div>

            <ul className="list-unstyled mt-4">
              {observacionesFiltradas.map((obs, idx) => (
                <li key={idx} className="border rounded-3 p-3 mb-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-bold">
                        <i className="fas fa-user-graduate me-1 text-secondary"></i>
                        {obs.psicologo_nombre} {obs.psicologo_apellido}
                      </h6>
                      <small className="text-muted">
                        <i className="far fa-calendar-alt me-1"></i>
                        {new Date(obs.fecha_creacion).toLocaleDateString()}{" "}
                        <i className="far fa-clock ms-2 me-1"></i>
                        {new Date(obs.fecha_creacion).toLocaleTimeString()}
                      </small>
                    </div>
                    <span className="badge bg-primary">Observación</span>
                  </div>

                  {editandoComentarioId === obs.id ? (
                    <>
                      <textarea
                        className="form-control form-control-sm mt-3"
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                      />
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleGuardarComentarioEditado(obs.id, modalEstudianteId)}
                        >
                          Guardar
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditandoComentarioId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 mb-2 text-break" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {obs.comentario}
                      </p>                      {parseInt(obs.psicologo_id) === parseInt(psicologoId) && (
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditarComentario(obs.id, obs.comentario)}
                          >
                            <i className="fas fa-edit me-1"></i> Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleEliminarComentario(obs.id, modalEstudianteId)}
                          >
                            <i className="fas fa-trash-alt me-1"></i> Eliminar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {
        modalHistorialVisible && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h5 className="mb-3">Historial de citas</h5>
              <button className="modal-close" onClick={cerrarModalHistorial}>✕</button>
              <ul className="list-unstyled small mt-3">
                {(historiales[modalHistorialEstudianteId] || []).map((h, idx) => (
                  <li key={idx} className="mb-3 border-bottom pb-2">
                    <strong>{h.tipo_cita.toUpperCase()}</strong> — {new Date(h.fecha_inicio).toLocaleString()}
                    <br />
                    <span className="text-muted">Estado: {h.estado}</span>
                  </li>
                ))}
                {(!historiales[modalHistorialEstudianteId] || historiales[modalHistorialEstudianteId].length === 0) && (
                  <li className="text-muted">Sin historial de citas</li>
                )}
              </ul>
            </div>
          </div>
        )
      }
    </div >
  );
}