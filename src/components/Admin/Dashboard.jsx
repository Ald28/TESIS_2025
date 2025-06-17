import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiRefreshCw } from "react-icons/fi";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaTasks, FaClock, FaGoogle } from "react-icons/fa";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
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
import {
  listarMetodosRecomendados,
  listarTodosMetodosPrivados,
} from "../Api/api_metodos";

const socket = io(import.meta.env.VITE_SOCKET_URL);

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
  const [totalHorasDisponibles, setTotalHorasDisponibles] = useState(0);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [actividadesSubidasData, setActividadesSubidasData] = useState([]);
  const [totalActividades, setTotalActividades] = useState(0);
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

  const calcularTotalHoras = (bloques) => {
    let totalHoras = 0;

    bloques.forEach((bloque) => {
      const inicio = new Date(`2000-01-01T${bloque.hora_inicio}`);
      const fin = new Date(`2000-01-01T${bloque.hora_fin}`);
      const horas = (fin - inicio) / (1000 * 60 * 60); // ms → h
      totalHoras += horas;
    });

    return totalHoras;
  };

  const manejarSeleccion = (categoria) => {
    setCategoriaSeleccionada(categoria);
  };

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
        setTotalHorasDisponibles(calcularTotalHoras(disponibilidadData.disponibilidad || []));
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

    const handleCalendarConnected = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const { psicologo_id } = await buscarPsicologoPorUsuarioId(usuario.id);
        const conectado = await verificarConexionCalendar(psicologo_id);
        setCalendarConectado(conectado);
        toast.success("Conexión con Google Calendar completada");
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

      // 🔌 Unirse a sala con socket.io
      socket.emit("join", usuario.id);

      socket.on("nuevaNotificacion", (data) => {
        console.log("📨 Notificación web recibida:", data);
        toast.info(`${data.titulo}: ${data.mensaje}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
        });
      });
    }

    fetchCitas();
    fetchActividadesSubidas();

    return () => {
      socket.off("nuevaNotificacion");
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

  const actividadesData = citas.reduce((acc, cita) => {
    const fecha = new Date(cita.fecha).toLocaleDateString(); // agrupar por fecha legible
    const existente = acc.find(item => item.fecha === fecha);

    if (existente) {
      existente.actividades += 1;
    } else {
      acc.push({ fecha, actividades: 1 });
    }

    return acc;
  }, []);

  const disponibilidadData = disponibilidades.map(bloque => {
    const horas =
      (new Date(`2000-01-01T${bloque.hora_fin}`) - new Date(`2000-01-01T${bloque.hora_inicio}`)) /
      3600000;

    return {
      dia: bloque.dia,
      horas,
    };
  });

  // Agrupamos las citas aceptadas por fecha
  const aceptadasData = citas
    .filter(cita => cita.estado === "aceptada")
    .reduce((acc, cita) => {
      const fecha = new Date(cita.fecha).toLocaleDateString();
      const existente = acc.find(item => item.fecha === fecha);
      if (existente) {
        existente.pacientes += 1;
      } else {
        acc.push({ fecha, pacientes: 1 });
      }
      return acc;
    }, []);

  // Agrupamos las citas pendientes por fecha
  const pendientesData = citas
    .filter(cita => cita.estado === "pendiente")
    .reduce((acc, cita) => {
      const fecha = new Date(cita.fecha).toLocaleDateString();
      const existente = acc.find(item => item.fecha === fecha);
      if (existente) {
        existente.citasPendientes += 1;
      } else {
        acc.push({ fecha, citasPendientes: 1 });
      }
      return acc;
    }, []);

  const aceptadasConLinea = [...aceptadasData];
  if (aceptadasConLinea.length === 1) {
    aceptadasConLinea.unshift({ fecha: "sin datos", pacientes: 0 });
  }

  const pendientesConLinea = [...pendientesData];
  if (pendientesConLinea.length === 1) {
    pendientesConLinea.unshift({ fecha: "sin datos", citasPendientes: 0 });
  }


  const fetchActividadesSubidas = async () => {
    try {
      const recomendados = await listarMetodosRecomendados();
      const privados = await listarTodosMetodosPrivados();
      const todos = [...recomendados, ...privados];

      // Agrupar por fecha
      const agrupados = todos.reduce((acc, metodo) => {
        const rawFecha = metodo.createdAt || metodo.fecha_creacion || metodo.fecha || new Date().toISOString();
        const fechaObj = new Date(rawFecha);
        if (isNaN(fechaObj)) return acc;

        const fecha = fechaObj.toLocaleDateString("es-PE");
        const encontrado = acc.find(item => item.fecha === fecha);

        if (encontrado) {
          encontrado.actividades += 1;
        } else {
          acc.push({ fecha, actividades: 1 });
        }
        return acc;
      }, []);

      setActividadesSubidasData(agrupados);
      setTotalActividades(todos.length);
    } catch (error) {
      console.error("Error al obtener actividades:", error);
    }
  };

  const actividadesConLinea = [...actividadesSubidasData];
  if (actividadesConLinea.length === 1) {
    actividadesConLinea.unshift({
      fecha: "sin datos",
      actividades: 0
    });
  }

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
          <Card onClick={() => manejarSeleccion("aceptada")} className="p-3 h-100 glass-card" style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Pacientes Activos</h6>
                <h4>{citas.filter(c => c.estado === "aceptada").length}</h4>
              </div>
              <FaUsers size={30} className="text-primary" />
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card onClick={() => manejarSeleccion("pendiente")} className="p-3 h-100 glass-card" style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Citas Pendientes</h6>
                <h4>{citas.filter(c => c.estado === "pendiente").length}</h4>
              </div>
              <FaCalendarCheck size={30} className="text-warning" />
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card onClick={() => manejarSeleccion("actividades")} className="p-3 h-100 glass-card" style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Actividades</h6>
                <h4>{totalActividades}</h4>
              </div>
              <FaTasks size={30} className="text-success" />
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card onClick={() => manejarSeleccion("disponibilidad")} className="p-3 h-100 glass-card" style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold">Horas Disponibles</h6>
                <h4>{totalHorasDisponibles.toFixed(1)}</h4>
              </div>
              <FaClock size={30} className="text-info" />
            </div>
          </Card>
        </Col>
      </Row>

      {categoriaSeleccionada === "aceptada" && (
        <>
          <h5 className="mt-4">Gráfico de Pacientes Activos por Fecha</h5>
          {aceptadasConLinea.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aceptadasConLinea} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ angle: -90, position: "insideLeft" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="pacientes" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay citas aceptadas registradas.</p>
          )}
        </>
      )}

      {categoriaSeleccionada === "pendiente" && (
        <>
          <h5 className="mt-4">Gráfico de Citas Pendientes por Fecha</h5>
          {pendientesConLinea.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pendientesConLinea} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ angle: -90, position: "insideLeft" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="citasPendientes" fill="#ffc107" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay citas pendientes registradas.</p>
          )}
        </>
      )}

      {categoriaSeleccionada === "actividades" && (
        <>
          <h5 className="mt-4">Gráfico de Actividades Subidas por Fecha</h5>
          {actividadesConLinea.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actividadesConLinea} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis label={{ angle: -90, position: "insideLeft" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="actividades" fill="#28a745" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay actividades registradas para mostrar.</p>
          )}
        </>
      )}

      {categoriaSeleccionada === "disponibilidad" && (
        <>
          <h5 className="mt-4">Gráfico de Disponibilidad por Día</h5>
          {disponibilidadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={disponibilidadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="horas" fill="#17a2b8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay disponibilidad registrada para mostrar.</p>
          )}
        </>
      )}

      <Accordion defaultActiveKey="0" className="mt-4 shadow-sm border-0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="fw-semibold">Horas Disponibles</div>
          </Accordion.Header>

          <Accordion.Body>
            <div className="d-flex justify-content-end mb-3 gap-2">
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
                          variant="success"
                          size="sm"
                          onClick={() => handleEditarDisponibilidad(disp)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEliminarDisponibilidad(disp.dia, disp.turno)}
                        >
                          <i className="bi bi-trash-fill"></i> Eliminar
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
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" className="mt-4 shadow-sm border-0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="fw-semibold">Citas Pendientes</div>
          </Accordion.Header>

          <Accordion.Body>
            <div className="d-flex justify-content-end mb-3">
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
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

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
                <Form.Select
                  name="dia"
                  value={formData.dia || ""}
                  onChange={handleFormChange}
                  disabled={!!disponibilidadEditando}
                >
                  <option value="">Selecciona un día</option>
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miércoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                </Form.Select>
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
                    <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Horario permitido: 08:30 am – 12:30 am
                    </Form.Text>
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
                    <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Horario permitido: 13:30 pm – 17:30 pm
                    </Form.Text>
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