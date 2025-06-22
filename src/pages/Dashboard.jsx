import {useState} from "react";
import MainLayout from "../layouts/MainLayout";
import { Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaUserTie, FaCalendarAlt, FaClock } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const datosPorTipo = {
  estudiantes: [
    { name: "Mon", sesiones: 10 },
    { name: "Tue", sesiones: 15 },
    { name: "Wed", sesiones: 18 },
    { name: "Thu", sesiones: 22 },
    { name: "Fri", sesiones: 19 },
    { name: "Sat", sesiones: 12 },
    { name: "Sun", sesiones: 8 },
  ],
  psicologos: [
    { name: "Mon", sesiones: 4 },
    { name: "Tue", sesiones: 5 },
    { name: "Wed", sesiones: 6 },
    { name: "Thu", sesiones: 5 },
    { name: "Fri", sesiones: 7 },
    { name: "Sat", sesiones: 3 },
    { name: "Sun", sesiones: 2 },
  ],
  citasRealizadas: [
    { name: "Mon", sesiones: 30 },
    { name: "Tue", sesiones: 25 },
    { name: "Wed", sesiones: 40 },
    { name: "Thu", sesiones: 45 },
    { name: "Fri", sesiones: 35 },
    { name: "Sat", sesiones: 20 },
    { name: "Sun", sesiones: 10 },
  ],
  citasPendientes: [
    { name: "Mon", sesiones: 20 },
    { name: "Tue", sesiones: 22 },
    { name: "Wed", sesiones: 25 },
    { name: "Thu", sesiones: 23 },
    { name: "Fri", sesiones: 18 },
    { name: "Sat", sesiones: 15 },
    { name: "Sun", sesiones: 10 },
  ],
};

const Dashboard = () => {

  const [opcionSeleccionada, setOpcionSeleccionada] = useState("estudiantes");

  return (
    <MainLayout>
      <h2 className="mb-4">Dashboard</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 card" onClick={() => setOpcionSeleccionada("estudiantes")} style={{ cursor: "pointer" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Estudiantes</h5>
                <h4>1,248</h4>
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
                <h4>64</h4>
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
                <h4>512</h4>
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
                <h4>1,024</h4>
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