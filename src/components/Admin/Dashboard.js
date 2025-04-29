import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Container, Row, Col, Card, Button, Table, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaTasks, FaClock, FaGoogle } from "react-icons/fa";
import {
  obtenerCitasDelPsicologo,
  conectarGoogleCalendar,
  crearDisponibilidad,
  cambiarEstadoCita,
  obtenerDisponibilidadPsicologo,
  buscarPsicologoPorUsuarioId
} from "../Api/api_psicologo";

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: "", apellido_paterno: "" });
  const [showModal, setShowModal] = useState(false);
  const [citas, setCitas] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({ dia: "", hora_inicio: "", hora_fin: "" });
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [mostrarDisponibilidades, setMostrarDisponibilidades] = useState(false);

  const fetchCitas = async () => {
    try {
      const token = localStorage.getItem("token");
      const citasData = await obtenerCitasDelPsicologo(token);
      setCitas(citasData.citas || []);

      const user = JSON.parse(localStorage.getItem("usuario"));
      if (user) {
        const psicologoData = await buscarPsicologoPorUsuarioId(user.id);
        const psicologoId = psicologoData.psicologo_id;

        const disponibilidadData = await obtenerDisponibilidadPsicologo(psicologoId);
        setDisponibilidades(disponibilidadData.disponibilidad || []);
      }

    } catch (error) {
      console.error("Error al obtener citas o disponibilidad:", error.message);
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
      fetchCitas();
    } catch (error) {
      console.error(error.message);
      alert("Error al crear disponibilidad");
    }
  };

  const handleAceptarCita = async (cita_id) => {
    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id, estado: "aceptada", evento_google_id: null }, token);
      fetchCitas();
    } catch (error) {
      console.error(error.message);
      alert("Error al aceptar la cita");
    }
  };

  const handleRechazarCita = async (cita_id) => {
    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id, estado: "rechazada", evento_google_id: null }, token);
      fetchCitas();
    } catch (error) {
      console.error(error.message);
      alert("Error al rechazar la cita");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Container fluid>

        <div className="mb-4">
          <h2 className="fw-bold text-dark">
            Bienvenida, {usuario.nombre} {usuario.apellido_paterno}
          </h2>
          <p className="text-muted">Gestiona tus citas y disponibilidad.</p>
        </div>

        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaUsers size={30} className="text-primary mb-2" />
                <h6 className="fw-semibold">Pacientes Activos</h6>
                <p className="fw-bold fs-4 mb-0">{citas.filter(c => c.estado === 'aceptada').length}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaCalendarCheck size={30} className="text-success mb-2" />
                <h6 className="fw-semibold">Sesiones</h6>
                <p className="fw-bold fs-4 mb-0">{citas.length}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaTasks size={30} className="text-warning mb-2" />
                <h6 className="fw-semibold">Actividades</h6>
                <p className="fw-bold fs-4 mb-0">23</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaClock size={30} className="text-danger mb-2" />
                <h6 className="fw-semibold">Horas Programadas</h6>
                <p className="fw-bold fs-4 mb-0">86</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-semibold mb-3">Crear Disponibilidad</h5>
                <Form>
                  <Row className="g-3 align-items-center">
                    <Col md={4}>
                      <Form.Select
                        value={disponibilidad.dia}
                        onChange={(e) => setDisponibilidad({ ...disponibilidad, dia: e.target.value })}
                      >
                        <option value="">Selecciona un día</option>
                        <option>Lunes</option>
                        <option>Martes</option>
                        <option>Miércoles</option>
                        <option>Jueves</option>
                        <option>Viernes</option>
                        <option>Sábado</option>
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        value={disponibilidad.hora_inicio}
                        onChange={(e) => setDisponibilidad({ ...disponibilidad, hora_inicio: e.target.value })}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="time"
                        value={disponibilidad.hora_fin}
                        onChange={(e) => setDisponibilidad({ ...disponibilidad, hora_fin: e.target.value })}
                      />
                    </Col>
                    <Col md={12} className="mt-3">
                      <Button
                        className="w-100"
                        style={{ backgroundColor: "#6c63ff", border: "none" }}
                        onClick={handleCrearDisponibilidad}
                      >
                        Crear Disponibilidad
                      </Button>
                    </Col>
                  </Row>

                </Form>
              </Card.Body>
              <h5
                className="fw-semibold mt-4"
                onClick={() => setMostrarDisponibilidades(!mostrarDisponibilidades)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                Disponibilidad Actual {mostrarDisponibilidades ? "▲" : "▼"}
              </h5>

              {mostrarDisponibilidades && (
                <Table hover responsive borderless className="mt-3">
                  <thead className="table-light">
                    <tr>
                      <th>Día</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disponibilidades.length > 0 ? (
                      disponibilidades.map((disp, index) => (
                        <tr key={index}>
                          <td>{disp.dia}</td>
                          <td>{disp.hora_inicio}</td>
                          <td>{disp.hora_fin}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No tienes disponibilidad registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm text-center p-4">
              <FaGoogle size={40} className="text-danger mb-3" />
              <h5 className="fw-semibold">Sincroniza tu calendario</h5>
              <p className="text-muted small">Mantén tus citas organizadas y sincronizadas con tu calendario de Google.</p>
              <Button variant="danger" onClick={abrirModal}>
                Conectar Google Calendar
              </Button>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold mb-0">Citas Pendientes</h5>
              <Button variant="outline-primary" size="sm" onClick={fetchCitas} className="d-flex align-items-center gap-2">
                <FiRefreshCw size={18} />
                <span className="d-none d-md-inline">Refrescar</span>
              </Button>
            </div>

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
                {citas.filter(c => c.estado === "pendiente").length > 0 ? (
                  citas.filter(c => c.estado === "pendiente").map((cita, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{cita.estudiante_nombre}</strong><br />
                        <small className="text-muted">Estudiante</small>
                      </td>
                      <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                      <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className="badge bg-warning text-dark">Pendiente</span></td>
                      <td>
                        <Button size="sm" variant="success" onClick={() => handleAceptarCita(cita.id)}>Aceptar</Button>{" "}
                        <Button size="sm" variant="outline-danger" onClick={() => handleRechazarCita(cita.id)}>Rechazar</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No hay citas pendientes.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

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
