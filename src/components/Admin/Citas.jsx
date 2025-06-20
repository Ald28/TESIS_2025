import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaClock, FaCalendarAlt, FaCalendarCheck } from "react-icons/fa";
import {
  obtenerCitasAceptadas,
  cancelarCitaAceptada,
  crearCitaSeguimiento,
  listarEstudiantes,
} from "../Api/api_citas";
import { cambiarEstadoCita } from "../Api/api_psicologo";
import "../Styles/Citas.css";

export default function Citas() {
  const [citasNormales, setCitasNormales] = useState([]);
  const [citasSeguimiento, setCitasSeguimiento] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [vistaActual, setVistaActual] = useState("comunes");
  const fechaRef = useRef(null);
  const horaInicioRef = useRef(null);
  const horaFinRef = useRef(null);
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
      toast.success("Cita de seguimiento creada correctamente.");
      setShowModal(false);
      setNuevoCita({ estudiante_id: "", fecha: "", hora_inicio: "", hora_fin: "" });
    } catch (error) {
      toast.error("❌ Error al crear cita.");
      console.error(error);
    }
  };

  const handleRealizarCita = async (id) => {
    const result = await Swal.fire({
      title: "¿Cita realizada?",
      text: "Esta acción marcará la cita como realizada.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, marcar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id: id, estado: "realizada", evento_google_id: null }, token);
      setCitasNormales(prev => prev.filter(c => c.id !== id));
      setCitasSeguimiento(prev => prev.filter(c => c.id !== id));
      toast.success("Cita marcada como realizada.");
    } catch (err) {
      toast.error("❌ Error al marcar cita como realizada.");
      console.error(err);
    }
  };

  const handleCancelar = async (id) => {
    const result = await Swal.fire({
      title: "¿Cancelar esta cita?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No"
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await cancelarCitaAceptada(token, id);
      setCitasNormales(prev => prev.filter(c => c.id !== id));
      setCitasSeguimiento(prev => prev.filter(c => c.id !== id));
      toast.success("❌ Cita cancelada correctamente.");
    } catch (err) {
      toast.error("⚠️ Error al cancelar la cita.");
      console.error(err);
    }
  };

  return (
    <div className="citas-container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-5">
        {/* Título del panel con más margen y padding derecho */}
        <h1 className="fw-bold text-primary d-flex align-items-center gap-4 m-0 me-lg-7 pe-lg-5">
          <FaCalendarCheck size={28} />
          <span>Panel de Citas</span>
        </h1>

        {/* Botón Crear Seguimiento más separado aún */}
        <Button variant="primary" className="ps-md-3" onClick={() => setShowModal(true)}>
          Crear Seguimiento
        </Button>
      </div>

      {/* Botones de tabs debajo del título */}
      <div className="d-flex flex-wrap gap-4 mb-4">
        <Button
          variant={vistaActual === "comunes" ? "primary" : "outline-dark"}
          onClick={() => setVistaActual("comunes")}
        >
          Citas Comunes
        </Button>
        <Button
          variant={vistaActual === "seguimiento" ? "primary" : "outline-dark"}
          onClick={() => setVistaActual("seguimiento")}
        >
          Citas de Seguimiento
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
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => handleCancelar(cita.id)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleRealizarCita(cita.id)}
                        >
                          Realizada
                        </Button>
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
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => handleCancelar(cita.id)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleRealizarCita(cita.id)}
                        >
                          Realizada
                        </Button>
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
              <InputGroup>
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => fechaRef.current && fechaRef.current.showPicker?.()}
                >
                  <FaCalendarAlt />
                </InputGroup.Text>
                <Form.Control
                  ref={fechaRef}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={nuevoCita.fecha}
                  onChange={(e) => setNuevoCita({ ...nuevoCita, fecha: e.target.value })}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora Inicio</Form.Label>
              <InputGroup>
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => horaInicioRef.current?.showPicker?.() || horaInicioRef.current?.focus()}
                >
                  <FaClock />
                </InputGroup.Text>
                <Form.Control
                  ref={horaInicioRef}
                  type="time"
                  value={nuevoCita.hora_inicio}
                  onChange={(e) => setNuevoCita({ ...nuevoCita, hora_inicio: e.target.value })}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <Form.Label>Hora Fin</Form.Label>
              <InputGroup>
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => horaFinRef.current?.showPicker?.() || horaFinRef.current?.focus()}
                >
                  <FaClock />
                </InputGroup.Text>
                <Form.Control
                  ref={horaFinRef}
                  type="time"
                  value={nuevoCita.hora_fin}
                  onChange={(e) => setNuevoCita({ ...nuevoCita, hora_fin: e.target.value })}
                />
              </InputGroup>
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