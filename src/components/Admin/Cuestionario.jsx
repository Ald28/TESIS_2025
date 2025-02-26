import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button, Container, Row, Col, Modal, ListGroup } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { crearCuestaionario } from "../Api/api_cuestionarios";
import { cuestionarioPorPiscologo } from "../Api/api_cuestionarios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cuestionario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    psicologo_id: "",
  });
  const [cuestionarios, setCuestionarios] = useState([]); // Estado para almacenar los cuestionarios
  const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar el modal

  useEffect(() => {
    // Obtener datos del psicólogo logueado desde el localStorage
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
      setFormData((prev) => ({ ...prev, psicologo_id: user.id }));
      fetchCuestionarios(user.id); // Cargar cuestionarios del psicólogo
    } else {
      navigate("/"); // Si no hay usuario, redirigir al login
    }
  }, [navigate]);

  const fetchCuestionarios = async (psicologo_id) => {
    try {
      const data = await cuestionarioPorPiscologo(psicologo_id);
      setCuestionarios(data);
    } catch (error) {
      toast.error("❌ Error al cargar los cuestionarios.", { position: "top-right" });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearCuestaionario(formData);
      toast.success("✅ Cuestionario creado exitosamente!", { position: "top-right" });
      setFormData({ titulo: "", descripcion: "", psicologo_id: formData.psicologo_id });
      setShowModal(false); // Cerrar el modal al crear con éxito
      fetchCuestionarios(formData.psicologo_id); // Actualizar lista de cuestionarios
    } catch (err) {
      toast.error("❌ Error al crear el cuestionario. Inténtalo de nuevo.", { position: "top-right" });
    }
  };

  return (
    <Container className="mt-4">
      <ToastContainer /> {/* Contenedor de toasts */}

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="text-primary">
                <FaPlusCircle /> Cuestionarios
              </Card.Title>

              {/* Botón para abrir el modal */}
              <Button variant="success" onClick={() => setShowModal(true)}>
                Agregar Cuestionario
              </Button>

              {/* Lista de cuestionarios */}
              <ListGroup className="mt-3">
                {cuestionarios.length > 0 ? (
                  cuestionarios.map((cuestionario) => (
                    <ListGroup.Item key={cuestionario.id}>
                      <strong>{cuestionario.titulo}</strong> - {cuestionario.descripcion}
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No hay cuestionarios disponibles.</ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para agregar cuestionario */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear Cuestionario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Guardar Cuestionario
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
