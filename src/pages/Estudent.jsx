import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getEstudiantes, getHistorialRealizadas } from "../api/api_admin";
import { FaClock, FaUserMd, FaCalendarCheck, FaTimes, FaHistory } from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "../styles/Estudent.css";

export default function Estudent() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [filtroPsicologo, setFiltroPsicologo] = useState("");

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

  // Función para obtener el historial de citas de un estudiante
  const verHistorialCitas = async (estudiante_id) => {
    console.log("Estudiante ID usado para historial:", estudiante_id);

    try {
      const data = await getHistorialRealizadas(estudiante_id);
      setHistorial(data);
      setShowModal(true);
      setSelectedEstudiante(estudiante_id);
    } catch (error) {
      console.error("Error al obtener historial de citas realizadas:", error);
      setHistorial([]);
      setShowModal(true);
    }
  };

  const historialFiltrado = historial
    ? historial.filter((cita) =>
      `${cita.nombre_psicologo} ${cita.apellido_psicologo}`
        .toLowerCase()
        .includes(filtroPsicologo.toLowerCase())
    )
    : [];

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
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaHistory style={{ marginRight: "8px", color: "#0d6efd" }} />
              Historial de Citas Realizadas
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <input
              type="text"
              placeholder="Filtrar por psicólogo..."
              className="form-control mb-3"
              value={filtroPsicologo}
              onChange={(e) => setFiltroPsicologo(e.target.value)}
            />

            {historial && historial.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {historialFiltrado.map((cita) => (
                  <div
                    key={cita.cita_id}
                    style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <p>
                      <FaClock style={{ marginRight: "6px", color: "#6c757d" }} />
                      <strong>Fecha:</strong>{' '}
                      {new Date(cita.fecha_inicio).toLocaleString()} –{' '}
                      {new Date(cita.fecha_fin).toLocaleTimeString()}
                    </p>
                    <p>
                      <FaUserMd style={{ marginRight: "6px", color: "#6c757d" }} />
                      <strong>Psicólogo:</strong>{' '}
                      {cita.nombre_psicologo} {cita.apellido_psicologo}
                    </p>
                    <p>
                      <FaCalendarCheck style={{ marginRight: "6px", color: "#6c757d" }} />
                      <strong>Tipo de cita:</strong> {cita.tipo_cita}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">
                <FaTimes style={{ marginRight: "6px" }} />
                No se encontraron citas realizadas.
              </p>
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