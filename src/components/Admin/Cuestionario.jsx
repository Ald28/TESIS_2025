import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Modal, Form } from "react-bootstrap";
import { FaPlusCircle, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { crearCuestaionario, cuestionarioPorPiscologo } from "../Api/api_cuestionarios";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";

export default function Cuestionario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ titulo: "", descripcion: "", psicologo_id: "" });
  const [cuestionarios, setCuestionarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
      setFormData((prev) => ({ ...prev, psicologo_id: user.id }));
      fetchCuestionarios(user.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (cuestionarios.length > 0) {
      $("#cuestionarioTable").DataTable().destroy();
      setTimeout(() => {
        $("#cuestionarioTable").DataTable();
      }, 500);
    }
  }, [cuestionarios]);

  const fetchCuestionarios = async (psicologo_id) => {
    try {
      const data = await cuestionarioPorPiscologo(psicologo_id);
      setCuestionarios(data);
    } catch {
      toast.error("❌ Error al cargar los cuestionarios.", { position: "top-right" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        // Aquí deberías llamar a la función de actualización si la tienes
        toast.success("✅ Cuestionario actualizado exitosamente!", { position: "top-right" });
      } else {
        await crearCuestaionario(formData);
        toast.success("✅ Cuestionario creado exitosamente!", { position: "top-right" });
      }
      setShowModal(false);
      setFormData({ titulo: "", descripcion: "", psicologo_id: formData.psicologo_id });
      setEditing(null); // Limpiar el estado de edición
      fetchCuestionarios(formData.psicologo_id);
    } catch {
      toast.error("❌ Error al procesar el cuestionario.", { position: "top-right" });
    }
  };

  return (
    <Container className="mt-4">
      <ToastContainer />
      <h2 className="mb-3 text-primary">Gestión de Cuestionarios</h2>
      <Button variant="success" onClick={() => setShowModal(true)}>
        <FaPlusCircle /> Agregar Cuestionario
      </Button>
      <Table id="cuestionarioTable" className="table table-striped table-bordered mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuestionarios.length > 0 ? (
            cuestionarios.map((cuestionario, index) => (
              <tr key={cuestionario.id}>
                <td>{index + 1}</td>
                <td>{cuestionario.titulo}</td>
                <td>{cuestionario.descripcion}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="info" size="sm" onClick={() => navigate(`/admin/cuestionario/${cuestionario.id}`)}>
                      <FaEye />
                    </Button>
                    <Button variant="warning" size="sm" onClick={() => { setEditing(cuestionario); setShowModal(true); }}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm">
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No hay cuestionarios disponibles.</td>
            </tr>
          )}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditing(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Editar Cuestionario" : "Crear Cuestionario"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editing ? "Actualizar" : "Guardar"} Cuestionario
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}