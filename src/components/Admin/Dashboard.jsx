import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Table, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaTasks, FaClock, FaGoogle } from "react-icons/fa";
import {
  obtenerCitasDelPsicologo,
  conectarGoogleCalendar,
  crearDisponibilidad,
  cambiarEstadoCita
} from "../Api/api_psicologo";

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: "", apellido_paterno: "" });
  const [showModal, setShowModal] = useState(false);
  const [citas, setCitas] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({ dia: "", hora_inicio: "", hora_fin: "" });

  const fetchCitas = async () => {
    try {
      const token = localStorage.getItem("token");
      const citasData = await obtenerCitasDelPsicologo(token);
      setCitas(citasData.citas || []);
    } catch (error) {
      console.error("Error al obtener citas:", error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }

    const fetchCitas = async () => {
      try {
        const citasData = await obtenerCitasDelPsicologo(token);
        setCitas(citasData.citas || []);
      } catch (error) {
        console.error("Error al obtener citas:", error.message);
      }
    };

    fetchCitas();
  }, [navigate]);

  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => setShowModal(false);

  const handleConectarCalendar = () => {
    conectarGoogleCalendar();
    cerrarModal();
  };

  const handleCrearDisponibilidad = async () => {
    try {
      await crearDisponibilidad(disponibilidad);
      alert("Disponibilidad creada exitosamente!");
      setDisponibilidad({ dia: "", hora_inicio: "", hora_fin: "" });
    } catch (error) {
      console.error(error.message);
      alert("Error al crear disponibilidad");
    }
  };

  const handleAceptarCita = async (cita_id) => {
    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id, estado: "aceptada", evento_google_id: null }, token);
      window.location.reload();
    } catch (error) {
      console.error(error.message);
      alert("Error al aceptar la cita");
    }
  };

  const handleRechazarCita = async (cita_id) => {
    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id, estado: "rechazada", evento_google_id: null }, token);
      window.location.reload();
    } catch (error) {
      console.error(error.message);
      alert("Error al rechazar la cita");
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <Container fluid>

        <h2 className="text-primary mb-4 fw-semibold">
          Bienvenido, {usuario.nombre} {usuario.apellido_paterno}
        </h2>

        {/* KPIs */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaUsers size={24} className="text-primary mb-2" />
                <h6>Pacientes Activos</h6>
                <p className="fw-bold mb-0">{citas.filter(c => c.estado === 'aceptada').length}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaCalendarCheck size={24} className="text-success mb-2" />
                <h6>Sesiones</h6>
                <p className="fw-bold mb-0">{citas.length}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaTasks size={24} className="text-warning mb-2" />
                <h6>Actividades</h6>
                <p className="fw-bold mb-0">23</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <FaClock size={24} className="text-danger mb-2" />
                <h6>Horas Programadas</h6>
                <p className="fw-bold mb-0">86</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Disponibilidad + Calendar */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Crear Disponibilidad</h5>
                <Row className="g-2 align-items-center">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Día (Ej: Lunes, Martes)"
                      value={disponibilidad.dia}
                      onChange={(e) => setDisponibilidad({ ...disponibilidad, dia: e.target.value })}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="time"
                      value={disponibilidad.hora_inicio}
                      onChange={(e) => setDisponibilidad({ ...disponibilidad, hora_inicio: e.target.value })}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="time"
                      value={disponibilidad.hora_fin}
                      onChange={(e) => setDisponibilidad({ ...disponibilidad, hora_fin: e.target.value })}
                    />
                  </Col>
                  <Col md={2}>
                    <div className="d-grid">
                      <Button variant="primary" onClick={handleCrearDisponibilidad}>
                        Crear
                      </Button>
                    </div>
                  </Col>
                </Row>

              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <FaGoogle size={32} className="text-danger mb-3" />
                <h5>Conectar Calendar</h5>
                <Button variant="danger" size="sm" onClick={abrirModal} className="mt-2">
                  Conectar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabla de citas */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {/* 🔵 Encabezado con botón Refrescar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Citas Pendientes</h5>
              <Button variant="outline-primary" size="sm" onClick={fetchCitas}>
                Refrescar
              </Button>
            </div>

            {/* 🔵 Tabla de citas */}
            <Table responsive borderless hover>
              <thead className="table-light">
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.filter(c => c.estado === "pendiente").length > 0 ? (
                  citas.filter(c => c.estado === "pendiente").map((cita, index) => (
                    <tr key={index}>
                      <td>{cita.estudiante_nombre}</td>
                      <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                      <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <Button size="sm" variant="success" onClick={() => handleAceptarCita(cita.id)}>Aceptar</Button>{" "}
                        <Button size="sm" variant="outline-danger" onClick={() => handleRechazarCita(cita.id)}>Rechazar</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No hay citas pendientes.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal Google Calendar */}
        <Modal show={showModal} onHide={cerrarModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Conectar Google Calendar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Accede a tu calendario para sincronizar tus sesiones.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConectarCalendar}>
              Conectar Ahora
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
}
