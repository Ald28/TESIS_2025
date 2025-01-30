import React from 'react';
import { FaUsers, FaCog, FaChartBar } from 'react-icons/fa';
import { Card, Row, Col, Container } from 'react-bootstrap';

export default function Dashboard() {
  return (
    <div>
      <Container fluid>
        <Row className="mb-4">
          <h2 className="text-primary">Bienvenido al Dashboard</h2>
        </Row>
        
        <Row className="mb-4">
          <Col lg={3} md={4} sm={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title><FaUsers /> Total de Usuarios</Card.Title>
                <Card.Text>1250</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={4} sm={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title><FaChartBar /> Total de Sesiones</Card.Title>
                <Card.Text>3200</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={4} sm={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title><FaCog /> Ajustes del Sistema</Card.Title>
                <Card.Text>Configura el sistema</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8} md={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Estadísticas del Mes</Card.Title>
                <div style={{ height: '300px', backgroundColor: '#f0f0f0' }}>
                  <p className="text-center" style={{ lineHeight: '300px' }}>Gráfico de Estadísticas</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Usuarios Recientes</Card.Title>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Juan Pérez</td>
                      <td>juan.perez@mail.com</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>María López</td>
                      <td>maria.lopez@mail.com</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Carlos Sánchez</td>
                      <td>carlos.sanchez@mail.com</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
