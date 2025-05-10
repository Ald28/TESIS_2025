import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import {
  obtenerCitasAceptadas,
  cancelarCitaAceptada,
  crearCitaSeguimiento,
  listarEstudiantes
} from "../Api/api_citas";

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
      obtenerCitasAceptadas(token)
        .then(setCitas)
        .catch((err) => {
          console.error("❌ Error al obtener citas aceptadas:", err);
        });

      listarEstudiantes()
        .then(setEstudiantes)
        .catch((err) => {
          console.error("❌ Error al listar estudiantes:", err);
        });
    }
  }, []);

  const handleCrearCita = async () => {
    try {
      const token = localStorage.getItem("token");
      await crearCitaSeguimiento(token, nuevoCita);
      alert("✅ Cita de seguimiento creada correctamente.");
      setShowModal(false);
      setNuevoCita({ estudiante_id: "", fecha: "", hora_inicio: "", hora_fin: "" });
    } catch (error) {
      console.error("❌ Error al crear cita de seguimiento:", error);
      alert("❌ Error al crear cita de seguimiento.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Citas Aceptadas</h3>

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        Crear Cita de Seguimiento
      </Button>

      <Table hover responsive borderless>
        <thead className="table-light">
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
            citas.map((cita, index) => (
              <tr key={index}>
                <td>
                  <strong>{cita.estudiante_nombre} {cita.estudiante_apellido}</strong><br />
                  <small className="text-muted">Estudiante</small>
                </td>
                <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td><span className="badge bg-success">Aceptada</span></td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={async () => {
                      const confirm = window.confirm("¿Estás seguro de cancelar esta cita?");
                      if (!confirm) return;

                      try {
                        const token = localStorage.getItem("token");
                        await cancelarCitaAceptada(token, cita.id);
                        setCitas((prev) => prev.filter((c) => c.id !== cita.id));
                      } catch (error) {
                        console.error("❌ Error al cancelar cita:", error);
                        alert("Ocurrió un error al cancelar la cita.");
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No hay citas aceptadas.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cita de Seguimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Seleccionar Estudiante</Form.Label>
              <Form.Select
                value={nuevoCita.estudiante_id}
                onChange={(e) =>
                  setNuevoCita({ ...nuevoCita, estudiante_id: e.target.value })
                }
              >
                <option value="">Seleccione un estudiante</option>
                {estudiantes.map((est) => (
                  <option key={est.estudiante_id} value={est.estudiante_id}>
                    {est.nombre} {est.apellido}
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
              <Form.Label>Hora de Inicio</Form.Label>
              <Form.Control
                type="time"
                value={nuevoCita.hora_inicio}
                onChange={(e) => setNuevoCita({ ...nuevoCita, hora_inicio: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Hora de Fin</Form.Label>
              <Form.Control
                type="time"
                value={nuevoCita.hora_fin}
                onChange={(e) => setNuevoCita({ ...nuevoCita, hora_fin: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCrearCita}>
            Crear Cita
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}