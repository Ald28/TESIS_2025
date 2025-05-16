import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import {
  obtenerCitasAceptadas,
  cancelarCitaAceptada,
  crearCitaSeguimiento,
  listarEstudiantes,
} from "../Api/api_citas";
import { cambiarEstadoCita } from "../Api/api_psicologo";
import "../styles/Citas.css";

export default function Citas() {
  const [citasNormales, setCitasNormales] = useState([]);
  const [citasSeguimiento, setCitasSeguimiento] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [vistaActual, setVistaActual] = useState("comunes");
  const [nuevoCita, setNuevoCita] = useState({
    estudiante_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      obtenerCitasAceptadas(token)
        .then((data) => {
          setCitasNormales(data.filter(c => !c.seguimiento_estado));
          setCitasSeguimiento(data.filter(c => c.seguimiento_estado));
        })
        .catch(console.error);

      listarEstudiantes().then(setEstudiantes).catch(console.error);
    }
  }, []);

  const handleCrearCita = async () => {
    try {
      const token = localStorage.getItem("token");
      await crearCitaSeguimiento(token, nuevoCita);
      alert("✅ Cita creada correctamente.");
      setShowModal(false);
      setNuevoCita({ estudiante_id: "", fecha: "", hora_inicio: "", hora_fin: "" });
    } catch (error) {
      alert("❌ Error al crear cita.");
    }
  };

  const handleRealizarCita = async (id) => {
    if (!window.confirm("¿Cita realizada?")) return;
    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id: id, estado: "realizada", evento_google_id: null }, token);
      setCitasNormales(prev => prev.filter(c => c.id !== id));
      setCitasSeguimiento(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("❌ Error al marcar realizada.");
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("¿Cancelar esta cita?")) return;
    try {
      const token = localStorage.getItem("token");
      await cancelarCitaAceptada(token, id);
      setCitasNormales(prev => prev.filter(c => c.id !== id));
      setCitasSeguimiento(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("❌ Error al cancelar.");
    }
  };

  return (
    <div className="citas-container">
      <div className="header">
        <div className="title-tabs">
          <h2 className="title">Citas Aceptadas</h2>
          <div className="tabs">
            <Button
              variant={vistaActual === "comunes" ? "dark" : "outline-dark"}
              onClick={() => setVistaActual("comunes")}
            >
              Citas Comunes
            </Button>
            <Button
              variant={vistaActual === "seguimiento" ? "dark" : "outline-dark"}
              className="ms-2"
              onClick={() => setVistaActual("seguimiento")}
            >
              Citas de Seguimiento
            </Button>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Crear Seguimiento
        </Button>
      </div>

      {vistaActual === "comunes" && (
        <div className="section-comunes">
          <div className="table-box">
            <h4 className="mb-3 text-center">Citas Comunes</h4>
            <Table hover responsive borderless className="modern-table shadow-sm rounded">
              <thead className="table-light text-center">
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasNormales.length > 0 ? (
                  citasNormales.map((cita) => (
                    <tr key={cita.id}>
                      <td>
                        <strong>{cita.estudiante_nombre} {cita.estudiante_apellido}</strong><br />
                        <small className="text-muted">Estudiante</small>
                      </td>
                      <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                      <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className="badge bg-success">Aceptada</span></td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => handleCancelar(cita.id)}>Cancelar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleRealizarCita(cita.id)}>Realizada</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No hay citas comunes.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {vistaActual === "seguimiento" && (
        <div className="section-seguimiento">
          <div className="table-box">
            <h4 className="mb-3 text-center">Citas de Seguimiento</h4>
            <Table hover responsive borderless className="modern-table shadow-sm rounded">
              <thead className="table-light text-center">
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Seguimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasSeguimiento.length > 0 ? (
                  citasSeguimiento.map((cita) => (
                    <tr key={cita.id}>
                      <td>
                        <strong>{cita.estudiante_nombre} {cita.estudiante_apellido}</strong><br />
                        <small className="text-muted">Estudiante</small>
                      </td>
                      <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                      <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={`badge ${cita.seguimiento_estado === 'activo' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                          {cita.seguimiento_estado}
                        </span>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => handleCancelar(cita.id)}>Cancelar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleRealizarCita(cita.id)}>Realizada</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No hay citas de seguimiento.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear Cita de Seguimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Estudiante</Form.Label>
              <Form.Select
                value={nuevoCita.estudiante_id}
                onChange={(e) => setNuevoCita({ ...nuevoCita, estudiante_id: e.target.value })}
              >
                <option value="">Seleccione...</option>
                {estudiantes.map((e) => (
                  <option key={e.estudiante_id} value={e.estudiante_id}>
                    {e.nombre} {e.apellido}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={nuevoCita.fecha}
                onChange={(e) => setNuevoCita({ ...nuevoCita, fecha: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora Inicio</Form.Label>
              <Form.Control
                type="time"
                value={nuevoCita.hora_inicio}
                onChange={(e) => setNuevoCita({ ...nuevoCita, hora_inicio: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Hora Fin</Form.Label>
              <Form.Control
                type="time"
                value={nuevoCita.hora_fin}
                onChange={(e) => setNuevoCita({ ...nuevoCita, hora_fin: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleCrearCita}>Crear</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}