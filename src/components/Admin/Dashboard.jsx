import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiRefreshCw } from "react-icons/fi";
import { Container, Row, Col, Card, Button, Table, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaTasks, FaClock, FaGoogle } from "react-icons/fa";
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { messaging } from '../services/firebase';
import { guardarTokenFCM } from "../Api/api_notificaciones";
import {
  obtenerCitasDelPsicologo,
  conectarGoogleCalendar,
  cambiarEstadoCita,
  buscarPsicologoPorUsuarioId,
  obtenerDisponibilidadPorTurno,
  crearDisponibilidadPsicologo,
  actualizarDisponibilidad,
  eliminarDisponibilidadPorTurno,
  verificarConexionCalendar,
} from "../Api/api_psicologo";

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: "", apellido_paterno: "" });
  const [showModal, setShowModal] = useState(false);
  const [citas, setCitas] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [mostrarDisponibilidades, setMostrarDisponibilidades] = useState(false);
  const [showModalDisponibilidad, setShowModalDisponibilidad] = useState(false);
  const [calendarConectado, setCalendarConectado] = useState(false);
  const abrirModalDisponibilidad = () => setShowModalDisponibilidad(true);
  const cerrarModalDisponibilidad = () => {
    setShowModalDisponibilidad(false);
    setDisponibilidadEditando(null);
    setFormData({
      dia: "",
      mañana_inicio: "",
      mañana_fin: "",
      tarde_inicio: "",
      tarde_fin: "",
      hora_inicio: "",
      hora_fin: "",
    });
  };

  const [disponibilidadEditando, setDisponibilidadEditando] = useState(null);
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
      return;
    }

    // 🔔 Función definida FUERA del if
    const handleCalendarConnected = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const { psicologo_id } = await buscarPsicologoPorUsuarioId(usuario.id);
        const conectado = await verificarConexionCalendar(psicologo_id);
        setCalendarConectado(conectado);
        toast.success("✅ Conexión con Google Calendar completada");
      } catch (err) {
        console.error("Error actualizando conexión calendar:", err);
      }
    };

    window.addEventListener("calendar-connected", handleCalendarConnected);

    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const usuario = JSON.parse(storedUser);
      setUsuario(usuario);

      const verificarConectado = async () => {
        const { psicologo_id } = await buscarPsicologoPorUsuarioId(usuario.id);
        const conectado = await verificarConexionCalendar(psicologo_id);
        setCalendarConectado(conectado);
      };

      verificarConectado();

      // 🔐 Obtener token FCM
      getToken(messaging, {
        vapidKey: "BB0WPjs9OnfG0bpHdwi-2nc9Y91T3eOSLSBZKpmubcH1DFeIkuu8yqV6M7d3WE30A856MGYmbsYpcGUJV2QMI0I"
      })
        .then(async (currentToken) => {
          try {
            await guardarTokenFCM(
              {
                token: currentToken,
                plataforma: "web",
                usuario_id: usuario.id,
              },
              token
            );
            localStorage.setItem("token_fcm", currentToken);
          } catch (error) {
            console.error("Error al guardar/verificar token FCM:", error.message);
          }
        })
        .catch((err) => console.error("Error al obtener token FCM:", err));
    }

    fetchCitas();

    // Escuchar notificaciones FCM
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification;

      toast.info(`${title}: ${body}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
      });
    });

    // 🧹 Limpieza: remover listener
    return () => {
      unsubscribe();
      window.removeEventListener("calendar-connected", handleCalendarConnected);
    };
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
      toast.success("Cita aceptada correctamente.");
      fetchCitas();
    } catch (error) {
      console.error(error.message);
      toast.error("❌ Error al aceptar la cita");
    }
  };

  const handleRechazarCita = async (cita_id) => {
    try {
      const token = localStorage.getItem("token");
      await cambiarEstadoCita({ cita_id, estado: "rechazada", evento_google_id: null }, token);
      toast.success("Cita rechazada correctamente.");
      fetchCitas();
    } catch (error) {
      console.error(error.message);
      toast.error("❌ Error al rechazar la cita");
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
      toast.success("Disponibilidad creada con éxito.");
      fetchCitas();
    } catch (error) {
      toast.error("Error al crear disponibilidad: " + (error.response?.data?.mensaje || error.message));
    }
  };

  const handleEditarDisponibilidad = (disponibilidad) => {
    setDisponibilidadEditando(disponibilidad);
    setFormData({
      dia: disponibilidad.dia,
      turno: disponibilidad.turno, // opcional si quieres mostrarlo
      hora_inicio: disponibilidad.hora_inicio,
      hora_fin: disponibilidad.hora_fin,
    });
    setShowModalDisponibilidad(true);
  };

  const handleActualizarDisponibilidad = async () => {
    try {
      const token = localStorage.getItem("token");
      const datos = {
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        psicologo_id: (await buscarPsicologoPorUsuarioId(JSON.parse(localStorage.getItem("usuario")).id)).psicologo_id,
      };

      await actualizarDisponibilidad(disponibilidadEditando.id, datos, token);
      toast.success("Disponibilidad actualizada correctamente.");
      fetchCitas();
      cerrarModalDisponibilidad();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar disponibilidad.");
    }
  };

  const handleEliminarDisponibilidad = async (dia, turno) => {
    try {
      const token = localStorage.getItem("token");
      await eliminarDisponibilidadPorTurno(dia, turno, token);
      toast.success("Disponibilidad eliminada correctamente.");
      fetchCitas();
    } catch (error) {
      console.error("Error al eliminar disponibilidad:", error);
      toast.error("❌ No se pudo eliminar la disponibilidad.");
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

      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">Horas Disponibles</h5>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={abrirModalDisponibilidad}>
                <i className="bi bi-plus-circle me-1"></i> Agregar Hora
              </Button>
              <Button
                variant="success"
                onClick={abrirModal}
                disabled={calendarConectado}
                title={calendarConectado ? "Ya conectado con Google Calendar" : ""}
              >
                <i className="bi bi-calendar-check me-1"></i>
                {calendarConectado ? "Conectado ✅" : "Conectar Google Calendar"}
              </Button>
            </div>
          </div>

          <Table hover responsive borderless className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Día</th>
                <th>Turno</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {disponibilidades.length > 0 ? (
                disponibilidades.map((disp, index) => (
                  <tr key={index} className="align-middle">
                    <td className="fw-medium text-capitalize">{disp.dia}</td>
                    <td className="text-capitalize">{disp.turno}</td>
                    <td>{disp.hora_inicio}</td>
                    <td>{disp.hora_fin}</td>
                    <td className="d-flex gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => handleEditarDisponibilidad(disp)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                        Editar
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => handleEliminarDisponibilidad(disp.dia, disp.turno)}
                      >
                        <i className="bi bi-trash-fill"></i>
                        Eliminar
                      </Button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted fst-italic">
                    No tienes disponibilidad registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

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
      <Modal show={showModalDisponibilidad} onHide={cerrarModalDisponibilidad} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {disponibilidadEditando ? "Editar Disponibilidad" : "Registrar Disponibilidad"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row className="align-items-end g-3">
              <Col md={12}>
                <Form.Label>Día</Form.Label>
                <Form.Control
                  type="text"
                  name="dia"
                  placeholder="ej. lunes"
                  value={formData.dia || ""}
                  onChange={handleFormChange}
                  disabled={!!disponibilidadEditando}
                />
              </Col>

              {/* Si se está editando una disponibilidad */}
              {disponibilidadEditando ? (
                <>
                  <Col md={12}>
                    <Form.Label>Hora Inicio</Form.Label>
                    <Form.Control
                      type="time"
                      name="hora_inicio"
                      value={formData.hora_inicio || ""}
                      onChange={handleFormChange}
                    />
                  </Col>

                  <Col md={12}>
                    <Form.Label>Hora Fin</Form.Label>
                    <Form.Control
                      type="time"
                      name="hora_fin"
                      value={formData.hora_fin || ""}
                      onChange={handleFormChange}
                    />
                  </Col>
                </>
              ) : (
                <>
                  {/* Si se está creando: mostrar campos para turno mañana y tarde */}
                  <Col md={12}>
                    <Form.Label>Turno Mañana</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          type="time"
                          name="mañana_inicio"
                          value={formData.mañana_inicio || ""}
                          onChange={handleFormChange}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="time"
                          name="mañana_fin"
                          value={formData.mañana_fin || ""}
                          onChange={handleFormChange}
                        />
                      </Col>
                    </Row>
                  </Col>

                  <Col md={12}>
                    <Form.Label>Turno Tarde</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          type="time"
                          name="tarde_inicio"
                          value={formData.tarde_inicio || ""}
                          onChange={handleFormChange}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="time"
                          name="tarde_fin"
                          value={formData.tarde_fin || ""}
                          onChange={handleFormChange}
                        />
                      </Col>
                    </Row>
                  </Col>
                </>
              )}
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalDisponibilidad}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (disponibilidadEditando) {
                handleActualizarDisponibilidad();
              } else {
                handleCrearDisponibilidad();
              }
            }}
          >
            {disponibilidadEditando ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </Container>
  );
}