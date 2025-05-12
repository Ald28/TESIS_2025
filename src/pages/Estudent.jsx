import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getEstudiantes } from "../api/api_admin";
import { FaUserGraduate } from "react-icons/fa";
import "../styles/Estudent.css";

export default function Estudent() {
  const [estudiantes, setEstudiantes] = useState([]);

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
            <option value="II">Ciclo III</option>
            <option value="II">Ciclo IV</option>
            <option value="II">Ciclo V</option>
            <option value="II">Ciclo VI</option>
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
                      <FaUserGraduate size={24} />
                    </div>
                    <div>
                      <div className="name">{est.nombre} {est.apellido}</div>
                      <div className="email">{est.correo}</div>
                    </div>
                  </td>
                  <td>{est.ciclo}</td>
                  <td>{est.edad}</td>
                  <td>{est.carrera}</td>
                  <td>
                    <button className="btn-more">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
