import React from "react";
import MainLayout from "../layouts/MainLayout";
import { Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaUserTie, FaCalendarAlt, FaClock } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", sesiones: 40 },
  { name: "Tue", sesiones: 30 },
  { name: "Wed", sesiones: 45 },
  { name: "Thu", sesiones: 50 },
  { name: "Fri", sesiones: 35 },
  { name: "Sat", sesiones: 25 },
  { name: "Sun", sesiones: 15 },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <h2 className="mb-4">Dashboard</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Usuarios</h5>
                <h4>1,248</h4>
                <small className="text-success">+12% este mes</small>
              </div>
              <FaUsers size={30} color="#0d6efd" />
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 card">
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
          <Card className="p-3 card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Citas Agendadas</h5>
                <h4>512</h4>
                <small className="text-success">+24% este mes</small>
              </div>
              <FaCalendarAlt size={30} color="#0d6efd" />
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Horas Disponibles</h5>
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
          <BarChart data={data}>
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