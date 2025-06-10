import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getEstudiantes, getHistorialCanceladas } from "../api/api_admin";
import { FaUserGraduate } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "../styles/Estudent.css";

export default function Estudent() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEstudiantes();
        setEstudiantes(data);
      } catch (error) {
        console.error("Error al cargar estudiantes", error);
      }
    };
    fetchData();
  }, []);

  // Función para obtener el historial de citas canceladas de un estudiante
  const verHistorialCitas = async (estudianteId) => {
    try {
      const historialData = await getHistorialCanceladas(estudianteId);
      console.log("Historial recibido:", historialData);
      setHistorial(historialData);
      setSelectedEstudiante(estudianteId);
      setShowModal(true);
    } catch (error) {
      console.error("Error al obtener historial de citas canceladas", error);
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setHistorial(null);
  };

  return (
    <MainLayout>
      <div className="estudiantes-container">
        <div className="header">
          <div>
            <h2 className="title">Estudiantes</h2>
            <p className="subtitle">Gestiona a los estudiantes registrados en el sistema</p>
          </div>
        </div>

        <div className="search-filter-bar">
          <input className="search-input" type="text" placeholder="Buscar estudiante..." />
          <select className="filter-select">
            <option value="">Todos los ciclos</option>
            <option value="I">Ciclo I</option>
            <option value="II">Ciclo II</option>
            <option value="III">Ciclo III</option>
            <option value="IV">Ciclo IV</option>
            <option value="V">Ciclo V</option>
            <option value="VI">Ciclo VI</option>
          </select>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Ciclo</th>
                <th>Edad</th>
                <th>Carrera</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.usuario_id}>
                  <td className="user-info">
                    <div className="avatar">
                      {est.imagen_url ? (
                        <img
                          src={est.imagen_url}
                          alt="Avatar"
                          className="avatar-image"
                        />
                      ) : (
                        <FaUserGraduate size={24} />
                      )}
                    </div>
                    <div>
                      <div className="name">{est.nombre} {est.apellido}</div>
                      <div className="email">{est.correo}</div>
                    </div>
                  </td>
                  <td>{est.ciclo}</td>
                  <td>{new Date().getFullYear() - new Date(est.fecha_nacimiento).getFullYear()}</td>
                  <td>{est.carrera}</td>
                  <td>
                    <button
                      className="btn-more"
                      onClick={() => verHistorialCitas(est.usuario_id)}
                      style={{ fontSize: "12px" }}
                    >
                      Ver Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para mostrar el historial de citas */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Historial de Citas Canceladas</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {historial ? (
              <ul>
                {historial.map((cita) => (
                  <li key={cita.cita_id}>
                    <p><strong>Cita:</strong> {cita.fecha_inicio} - {cita.fecha_fin}</p>
                    <p><strong>Psicólogo:</strong> {cita.nombre_psicologo} {cita.apellido_psicologo}</p>
                    <p><strong>Tipo de cita:</strong> {cita.tipo_cita}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se encontraron citas canceladas.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </MainLayout>
  );
}