import React, { useState, useEffect } from "react";
import { Plus, Save, Eye, X, Trash, Edit } from "lucide-react";
import { Modal, Button } from "react-bootstrap";
import {
  crearPregunta,
  crearOpcion,
  listarTodasLasRespuestas,
  listarPreguntasConOpciones
} from "../api/api_cuestionarios";
import { buscarPsicologoPorUsuarioId } from "../api/api_psicologo";

export default function Cuestionario() {
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [tipoPregunta, setTipoPregunta] = useState("cerrada");
  const [psicologoId, setPsicologoId] = useState(null);
  const [preguntasConOpciones, setPreguntasConOpciones] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarRespuestas, setMostrarRespuestas] = useState(false); // 👉 nuevo
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [respuestasEstudiante, setRespuestasEstudiante] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPsicologoId = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("usuario"));
        if (storedUser) {
          const data = await buscarPsicologoPorUsuarioId(storedUser.id);
          setPsicologoId(data.psicologo_id);
          await cargarPreguntas();
        }
      } catch (error) {
        console.error("Error al obtener psicólogo ID:", error.message);
      }
    };
    fetchPsicologoId();
  }, []);

  const cargarPreguntas = async () => {
    try {
      const data = await listarPreguntasConOpciones();
      setPreguntasConOpciones(data.preguntas);
    } catch (error) {
      console.error("Error al cargar preguntas:", error.message);
    }
  };

  const handleCrearPregunta = async () => {
    if (!psicologoId) return;

    try {
      const data = {
        txt_pregunta: nuevaPregunta,
        tipo: tipoPregunta,
        psicologo_id: psicologoId,
      };
      const response = await crearPregunta(data);
      const preguntaId = response.preguntaId;
      alert(`Pregunta creada con ID: ${preguntaId}`);
      setNuevaPregunta("");
      if (tipoPregunta === "cerrada") {
        await crearOpcion({ txt_opcion: "Sí", pregunta_id: preguntaId, psicologo_id: psicologoId });
        await crearOpcion({ txt_opcion: "No", pregunta_id: preguntaId, psicologo_id: psicologoId });
      }
      await cargarPreguntas();
      setShowForm(false);
    } catch (error) {
      console.error("Error al crear pregunta:", error.message);
    }
  };

  const handleListarRespuestas = async () => {
    if (!mostrarRespuestas) { // 👉 solo carga si aún no se ha cargado
      try {
        const data = await listarTodasLasRespuestas();
        setRespuestas(data.respuestas);
      } catch (error) {
        console.error("Error al listar respuestas:", error.message);
      }
    }
    setMostrarRespuestas(!mostrarRespuestas); // 👉 toggle (mostrar/ocultar)
  };

  const respuestasAgrupadas = respuestas.reduce((acc, respuesta) => {
    const key = respuesta.correo_estudiante;
    if (!acc[key]) {
      acc[key] = {
        nombre_estudiante: respuesta.nombre_estudiante,
        apellido_estudiante: respuesta.apellido_estudiante,
        correo_estudiante: respuesta.correo_estudiante,
        respuestas: [],
      };
    }
    acc[key].respuestas.push(respuesta);
    return acc;
  }, {});

  const abrirModal = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setRespuestasEstudiante(estudiante.respuestas);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setRespuestasEstudiante([]);
    setEstudianteSeleccionado(null);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 fw-bold text-primary">
        📋 Panel de Administración de Encuestas
      </h1>

      {/* Sección de Preguntas */}
      <div className="card shadow mb-5">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Preguntas</h5>
          <Button variant="light" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancelar" : "Agregar Pregunta"}
          </Button>
        </div>

        <div className="card-body">
          {showForm && (
            <div className="mb-4">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Escribe la nueva pregunta"
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
              />
              <select
                className="form-select mb-3"
                value={tipoPregunta}
                onChange={(e) => setTipoPregunta(e.target.value)}
              >
                <option value="cerrada">Cerrada (Sí/No)</option>
                <option value="abierto">Abierta (Texto libre)</option>
              </select>
              <Button variant="success" onClick={handleCrearPregunta}>
                <Save size={18} className="me-2" /> Guardar
              </Button>
            </div>
          )}

          {preguntasConOpciones.length > 0 ? (
            <ul className="list-group list-group-flush">
              {preguntasConOpciones.map((pregunta) => (
                <li key={pregunta.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1">{pregunta.txt_pregunta}</h6>
                    <span className={`badge rounded-pill me-2 ${
                      pregunta.tipo === 'cerrada' ? 'bg-primary' :
                      pregunta.tipo === 'abierto' ? 'bg-success' : 'bg-warning'
                    }`}>
                      {pregunta.tipo.charAt(0).toUpperCase() + pregunta.tipo.slice(1)}
                    </span>
                    {pregunta.opciones.length > 0 && (
                      <small className="text-muted">
                        {pregunta.opciones.map(o => o.txt_opcion).join(", ")}
                      </small>
                    )}
                  </div>
                  <div>
                    <Button variant="outline-primary" size="sm" className="me-2">
                      <Edit size={16} />
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <Trash size={16} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No hay preguntas registradas.</p>
          )}
        </div>
      </div>

      {/* Sección de Estudiantes */}
      <div className="card shadow mb-5">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Estudiantes</h5>
          <Button variant="light" onClick={handleListarRespuestas}>
            <Eye size={18} /> {mostrarRespuestas ? "Ocultar" : "Ver Respuestas"}
          </Button>
        </div>

        {mostrarRespuestas && (
          <div className="card-body">
            {Object.keys(respuestasAgrupadas).length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Correo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(respuestasAgrupadas).map((estudiante, idx) => (
                      <tr key={idx}>
                        <td>{estudiante.nombre_estudiante}</td>
                        <td>{estudiante.apellido_estudiante}</td>
                        <td>{estudiante.correo_estudiante}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => abrirModal(estudiante)}
                          >
                            <Eye size={16} className="me-1" />
                            Ver Detalles
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No hay estudiantes con respuestas aún.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal Respuestas */}
      <Modal show={mostrarModal} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Respuestas de {estudianteSeleccionado?.nombre_estudiante}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {respuestasEstudiante.length > 0 ? (
            <ul className="list-group">
              {respuestasEstudiante.map((respuesta, idx) => (
                <li key={idx} className="list-group-item">
                  <strong>Pregunta:</strong> {respuesta.txt_pregunta}<br />
                  <strong>Respuesta:</strong> {respuesta.tipo === "cerrada"
                    ? (respuesta.txt_opcion || "No respondida")
                    : (respuesta.respuesta_texto || "No respondida")}
                  <br />
                  <small className="text-muted">Fecha: {new Date(respuesta.fecha).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay respuestas registradas.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}