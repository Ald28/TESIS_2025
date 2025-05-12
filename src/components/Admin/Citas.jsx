import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import {
  obtenerCitasAceptadas,
  cancelarCitaAceptada,
  crearCitaSeguimiento,
  listarEstudiantes
} from "../Api/api_citas";
import "../styles/Citas.css";

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoCita, setNuevoCita] = useState({
    estudiante_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      obtenerCitasAceptadas(token).then(setCitas).catch(console.error);
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

  const handleCancelar = async (id) => {
    if (!window.confirm("¿Cancelar esta cita?")) return;
    try {
      const token = localStorage.getItem("token");
      await cancelarCitaAceptada(token, id);
      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("❌ Error al cancelar.");
    }
  };

  return (
    <div className="citas-container">
      <div className="header">
        <h2 className="title">Citas Aceptadas</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>Crear Seguimiento</Button>
      </div>

      <div className="table-wrapper">
        <Table hover responsive borderless className="modern-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.length > 0 ? (
              citas.map((cita) => (
                <tr key={cita.id}>
                  <td>
                    <strong>{cita.estudiante_nombre} {cita.estudiante_apellido}</strong>
                    <br />
                    <small className="text-muted">Estudiante</small>
                  </td>
                  <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                  <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><span className="badge bg-success">Aceptada</span></td>
                  <td>
                    <Button size="sm" variant="outline-danger" onClick={() => handleCancelar(cita.id)}>
                      Cancelar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">No hay citas aceptadas.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

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