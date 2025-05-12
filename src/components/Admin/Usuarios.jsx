import React, { useEffect, useState } from "react";
import { listarEstudiantesRelacionados } from "../Api/api_citas";
import { buscarPsicologoPorUsuarioId } from "../Api/api_psicologo";
import {
  crearCalificacion,
  obtenerCalificacionesPorEstudiante
} from "../Api/api_observacion";
import { FaUserGraduate } from "react-icons/fa";
import "../Styles/Usuarios.css";

export default function Usuarios() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [psicologoId, setPsicologoId] = useState(null);
  const [modalEstudianteId, setModalEstudianteId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
        }
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const abrirModalObservaciones = (estudianteId) => {
    setModalEstudianteId(estudianteId);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setModalEstudianteId(null);
  };

  const handleComentarioChange = (id, texto) => {
    setComentarios(prev => ({ ...prev, [id]: texto }));
  };

  const handleEnviarComentario = async (estudiante_id) => {
    const comentario = comentarios[estudiante_id];
    if (!comentario || comentario.trim() === "") {
      alert("Escribe un comentario antes de enviarlo.");
      return;
    }

    try {
      await crearCalificacion({
        psicologo_id: psicologoId,
        estudiante_id,
        comentario
      });

      const nuevasObservaciones = await obtenerCalificacionesPorEstudiante(estudiante_id);
      setObservaciones(prev => ({ ...prev, [estudiante_id]: nuevasObservaciones }));
      alert("✅ Comentario enviado correctamente.");
      setComentarios(prev => ({ ...prev, [estudiante_id]: "" }));
    } catch (error) {
      console.error("❌ Error al enviar comentario:", error);
      alert("❌ Error al enviar comentario.");
    }
  };

  return (
    <div className="estudiantes-container">
      <div className="header">
        <h2 className="title">Estudiantes</h2>
        <p className="subtitle">Gestiona a los estudiantes registrados en el sistema</p>
      </div>

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Ciclo</th>
              <th>Edad</th>
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
                      <FaUserGraduate size={20} />
                    </div>
                    <div>
                      <div className="name">{est.nombre} {est.apellido}</div>
                      <div className="email">{est.correo}</div>
                    </div>
                  </td>
                  <td>{est.ciclo || "-"}</td>
                  <td>{est.edad || "-"}</td>
                  <td>{est.carrera || "-"}</td>
                  <td>
                    <div className="comentario-container">
                      <textarea
                        className="form-control mb-2"
                        placeholder="Escribe un comentario"
                        value={comentarios[est.estudiante_id] || ""}
                        onChange={(e) =>
                          handleComentarioChange(est.estudiante_id, e.target.value)
                        }
                      />
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEnviarComentario(est.estudiante_id)}
                      >
                        Enviar
                      </button>
                      <button
                        className="btn btn-link btn-sm mt-2"
                        onClick={() => abrirModalObservaciones(est.estudiante_id)}
                      >
                        Ver observaciones
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

      {/* MODAL de observaciones */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5 className="mb-3">Observaciones del estudiante</h5>
            <button className="modal-close" onClick={cerrarModal}>✕</button>
            <ul className="list-unstyled small mt-2">
              {(observaciones[modalEstudianteId] || []).map((obs, idx) => (
                <li key={idx} className="mb-3">
                  <span className="fw-bold">
                    {obs.psicologo_nombre} {obs.psicologo_apellido}:
                  </span> {obs.comentario}
                  <br />
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {new Date(obs.fecha_creacion).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}