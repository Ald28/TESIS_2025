import { useEffect, useState } from "react";
import { getEstudiantes, getPsicologos, getHistorialRealizadas, getHistorialPendientes } from "../api/api_admin";
import MainLayout from "../layouts/MainLayout";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaUsers, FaUserTie, FaCalendarAlt, FaClock } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Función para convertir array de citas a conteo por día de la semana
const contarPorDiaSemana = (citas) => {
  const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const conteo = {
    Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
  };

  citas.forEach((cita) => {
    const fecha = new Date(cita.fecha_inicio);
    const dia = dias[fecha.getDay()];
    conteo[dia]++;
  });

  // Convertir a array para Recharts
  return dias.map((dia) => ({ name: dia, sesiones: conteo[dia] }));
};

const exportarExcel = async () => {
  try {
    // Obtener datos desde backend
    const estudiantes = await getEstudiantes();
    const psicologos = await getPsicologos();

    let citasRealizadas = [];
    let citasPendientes = [];

    for (const estudiante of estudiantes) {
      const realizadas = await getHistorialRealizadas(estudiante.usuario_id);
      const pendientes = await getHistorialPendientes(estudiante.usuario_id);
      citasRealizadas = [...citasRealizadas, ...realizadas];
      citasPendientes = [...citasPendientes, ...pendientes];
    }

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Estudiantes
    const hojaEstudiantes = estudiantes.map(e => ({
      Nombre: e.nombre,
      Apellido: e.apellido,
      Correo: e.email,
      Código: e.codigo,
      Teléfono: e.telefono,
    }));
    const wsEstudiantes = XLSX.utils.json_to_sheet(hojaEstudiantes);
    XLSX.utils.book_append_sheet(workbook, wsEstudiantes, "Estudiantes");

    // Hoja 2: Psicólogos
    const hojaPsicologos = psicologos.map(p => ({
      Nombre: p.nombre,
      Apellido: p.apellido,
      Correo: p.email,
      Especialidad: p.especialidad || "",
    }));
    const wsPsicologos = XLSX.utils.json_to_sheet(hojaPsicologos);
    XLSX.utils.book_append_sheet(workbook, wsPsicologos, "Psicologos");

    // Hoja 3: Citas Realizadas
    const hojaCitasRealizadas = citasRealizadas.map(c => ({
      Fecha: c.fecha_inicio,
      Hora: c.hora_inicio,
      Estado: c.estado,
      Estudiante: c.nombre_estudiante || "",
      Psicólogo: c.nombre_psicologo || "",
    }));
    const wsRealizadas = XLSX.utils.json_to_sheet(hojaCitasRealizadas);
    XLSX.utils.book_append_sheet(workbook, wsRealizadas, "Citas Realizadas");

    // Hoja 4: Citas Pendientes
    const hojaCitasPendientes = citasPendientes.map(c => ({
      Fecha: c.fecha_inicio,
      Hora: c.hora_inicio,
      Estado: c.estado,
      Estudiante: c.nombre_estudiante || "",
      Psicólogo: c.nombre_psicologo || "",
    }));
    const wsPendientes = XLSX.utils.json_to_sheet(hojaCitasPendientes);
    XLSX.utils.book_append_sheet(workbook, wsPendientes, "Citas Pendientes");

    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Reporte_Dashboard.xlsx");
  } catch (error) {
    console.error("Error exportando a Excel:", error);
  }
};

const Dashboard = () => {

  const [opcionSeleccionada, setOpcionSeleccionada] = useState("estudiantes");
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState(0);
  const [cantidadPsicologos, setCantidadPsicologos] = useState(0);
  const [historialRealizadas, setHistorialRealizadas] = useState(0);
  const [historialPendientes, setHistorialPendientes] = useState(0);
  const [datosCitasRealizadas, setDatosCitasRealizadas] = useState([]);
  const [datosCitasPendientes, setDatosCitasPendientes] = useState([]);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        const estudiantes = await getEstudiantes();
        setCantidadEstudiantes(estudiantes.length);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      }
    };

    const cargarPsicologos = async () => {
      try {
        const psicologos = await getPsicologos();
        setCantidadPsicologos(psicologos.length);
      } catch (error) {
        console.error("Error al cargar psicologos:", error);
      }
    };

    const cargarHistorialRealizadas = async () => {
      try {
        const estudiantes = await getEstudiantes();

        let totalHistorial = 0;
        let todasLasCitas = [];

        for (const estudiante of estudiantes) {
          const historial = await getHistorialRealizadas(estudiante.usuario_id);
          totalHistorial += historial.length;
          todasLasCitas = [...todasLasCitas, ...historial];
        }

        setHistorialRealizadas(totalHistorial);
        setDatosCitasRealizadas(contarPorDiaSemana(todasLasCitas));
      } catch (error) {
        console.error("Error al cargar historial de citas realizadas:", error);
      }
    };

    const cargarHistorialPendientes = async () => {
      try {
        const estudiantes = await getEstudiantes();

        let totalHistorial = 0;
        let todasLasCitas = [];

        for (const estudiante of estudiantes) {
          const historial = await getHistorialPendientes(estudiante.usuario_id);
          totalHistorial += historial.length;
          todasLasCitas = [...todasLasCitas, ...historial];
        }

        setHistorialPendientes(totalHistorial);
        setDatosCitasPendientes(contarPorDiaSemana(todasLasCitas));
      } catch (error) {
        console.error("Error al cargar historial de citas pendientes:", error);
      }
    };

    cargarHistorialPendientes();
    cargarHistorialRealizadas();
    cargarPsicologos();
    cargarEstudiantes();
  }, []);

  const datosPorTipo = {
    estudiantes: contarPorDiaSemana(Array(cantidadEstudiantes).fill({ fecha_inicio: new Date() })),
    psicologos: contarPorDiaSemana(Array(cantidadPsicologos).fill({ fecha_inicio: new Date() })),
    citasRealizadas: datosCitasRealizadas,
    citasPendientes: datosCitasPendientes,
  };

  return (
    <MainLayout>
      <Row className="align-items-center justify-content-between mb-4">
        <Col><h2 className="mb-0">Dashboard</h2></Col>
        <Col xs="auto">
          <Button variant="success" onClick={exportarExcel}>
            Exportar a Excel
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 card" onClick={() => setOpcionSeleccionada("estudiantes")} style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Estudiantes</h5>
                <h4>{cantidadEstudiantes}</h4>
                <small className="text-success">+12% este mes</small>
              </div>
              <FaUsers size={30} color="#0d6efd" />
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 card" onClick={() => setOpcionSeleccionada("psicologos")} style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Psicólogos</h5>
                <h4>{cantidadPsicologos}</h4>
                <small className="text-success">+8% este mes</small>
              </div>
              <FaUserTie size={30} color="#0d6efd" />
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 card" onClick={() => setOpcionSeleccionada("citasRealizadas")} style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Citas Realizadas</h5>
                <h4>{datosCitasRealizadas.reduce((sum, d) => sum + d.sesiones, 0)}</h4>
                <small className="text-success">+24% este mes</small>
              </div>
              <FaCalendarAlt size={30} color="#0d6efd" />
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 card" onClick={() => setOpcionSeleccionada("citasPendientes")} style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Citas pendientes</h5>
                <h4>{datosCitasPendientes.reduce((sum, d) => sum + d.sesiones, 0)}</h4>
                <small className="text-danger">-3% este mes</small>
              </div>
              <FaClock size={30} color="#0d6efd" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="p-4 card">
        <h5>Sesiones Semanales</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosPorTipo[opcionSeleccionada]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sesiones" fill="#91c3fd" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;