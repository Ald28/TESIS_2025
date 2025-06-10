import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getEstudiantes, getHistorialCanceladas } from "../api/api_admin";
import { FaUserGraduate } from "react-icons/fa";
import "../styles/Estudent.css";

export default function Estudent() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [historial, setHistorial] = useState(null);

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
      setHistorial(historialData);
      console.log("Historial de citas canceladas:", historialData);
    } catch (error) {
      console.error("Error al obtener historial de citas canceladas", error);
    }
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
                        <img src={est.imagen_url} alt="Avatar" />
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
                    >
                      Ver Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historial && (
          <div className="historial-container">
            <h3>Historial de Citas Canceladas</h3>
            <ul>
              {historial.map((cita) => (
                <li key={cita.cita_id}>
                  <p><strong>Cita:</strong> {cita.fecha_inicio} - {cita.fecha_fin}</p>
                  <p><strong>Psicólogo:</strong> {cita.nombre_psicologo} {cita.apellido_psicologo}</p>
                  <p><strong>Tipo de cita:</strong> {cita.tipo_cita}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
