import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Container, Row, Col, Card, Button, Table, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaTasks, FaClock, FaGoogle } from "react-icons/fa";
import {
  obtenerCitasDelPsicologo,
  conectarGoogleCalendar,
  cambiarEstadoCita,
  buscarPsicologoPorUsuarioId,
  obtenerDisponibilidadPorTurno,
  crearDisponibilidadPsicologo
} from "../Api/api_psicologo";

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: "", apellido_paterno: "" });
  const [showModal, setShowModal] = useState(false);
  const [citas, setCitas] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [mostrarDisponibilidades, setMostrarDisponibilidades] = useState(false);
  const [formData, setFormData] = useState({
    dia: "",
    mañana_inicio: "",
    mañana_fin: "",
    tarde_inicio: "",
    tarde_fin: ""
  });

  const fetchCitas = async () => {
    try {
      const token = localStorage.getItem("token");
      const citasData = await obtenerCitasDelPsicologo(token);
      setCitas(citasData.citas || []);

      const user = JSON.parse(localStorage.getItem("usuario"));
      if (user) {
        const psicologoData = await buscarPsicologoPorUsuarioId(user.id);
        const psicologoId = psicologoData.psicologo_id;

        const disponibilidadData = await obtenerDisponibilidadPorTurno(psicologoId);
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearDisponibilidad = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("usuario"));
      const psicologoData = await buscarPsicologoPorUsuarioId(user.id);
      const psicologo_id = psicologoData.psicologo_id;

      const dataConPsicologo = {
        ...formData,
        psicologo_id,
      };

      await crearDisponibilidadPsicologo(dataConPsicologo, token);
      alert("✅ Disponibilidad creada con éxito.");
      fetchCitas();
    } catch (error) {
      alert("❌ Error al crear disponibilidad: " + (error.response?.data?.mensaje || error.message));
    }
  };

  return (
    <Container fluid>
      <div className="mb-4">
        <h2 className="fw-bold text-dark">
          Bienvenido, {usuario.nombre} {usuario.apellido_paterno}
        </h2>
        <p className="text-muted">Gestiona tus citas y disponibilidad.</p>
      </div>

      <Row className="g-4 mb-4">
        <Col xs={12} md={6} lg={3}>
          <Card className="p-3 h-100 glass-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Pacientes Activos</h6>
                <h4>{citas.filter(c => c.estado === 'aceptada').length}</h4>
              </div>
              <FaUsers size={30} className="text-primary" />
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="p-3 h-100 glass-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Sesiones</h6>
                <h4>{citas.length}</h4>
              </div>
              <FaCalendarCheck size={30} className="text-success" />
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="p-3 h-100 glass-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Actividades</h6>
                <h4>23</h4>
              </div>
              <FaTasks size={30} className="text-warning" />
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card className="p-3 h-100 glass-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Horas Programadas</h6>
                <h4>86</h4>
              </div>
              <FaClock size={30} className="text-danger" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Table hover responsive borderless className="mt-3">
          <thead className="table-light">
            <tr>
              <th>Día</th>
              <th>Turno</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
            </tr>
          </thead>
          <tbody>
            {disponibilidades.length > 0 ? (
              disponibilidades.map((disp, index) => (
                <tr key={index} className="align-middle">
                  <td className="fw-medium text-capitalize">{disp.dia}</td>
                  <td className="fst-italic text-capitalize">{disp.turno}</td>
                  <td className="text-nowrap">{disp.hora_inicio}</td>
                  <td className="text-nowrap">{disp.hora_fin}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted fst-italic">
                  No tienes disponibilidad registrada.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h5 className="fw-semibold mb-3">Registrar Disponibilidad</h5>
            <Form>
              <Row className="align-items-end g-3">
                <Col md={2}>
                  <Form.Label>Día</Form.Label>
                  <Form.Control type="text" name="dia" placeholder="ej. lunes" onChange={handleFormChange} />
                </Col>

                <Col md={5}>
                  <Form.Label>Turno Mañana</Form.Label>
                  <Row>
                    <Col><Form.Control type="time" name="mañana_inicio" onChange={handleFormChange} /></Col>
                    <Col><Form.Control type="time" name="mañana_fin" onChange={handleFormChange} /></Col>
                  </Row>
                </Col>

                <Col md={5}>
                  <Form.Label>Turno Tarde</Form.Label>
                  <Row>
                    <Col><Form.Control type="time" name="tarde_inicio" onChange={handleFormChange} /></Col>
                    <Col><Form.Control type="time" name="tarde_fin" onChange={handleFormChange} /></Col>
                  </Row>
                </Col>
              </Row>

              <div className="mt-3 text-end">
                <Button onClick={handleCrearDisponibilidad}>Guardar</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Col md={12}>
          <Card className="border-0 shadow-sm text-center p-4">
            <FaGoogle size={40} className="text-danger mb-3" />
            <h5 className="fw-semibold">Sincroniza tu calendario</h5>
            <p className="text-muted small">
              Mantén tus citas organizadas y sincronizadas con tu calendario de Google.
            </p>
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
  );
}