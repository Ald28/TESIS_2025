import React, { useEffect, useState } from 'react';
import { listarEstudiantesRelacionados } from '../Api/api_citas';
import { buscarPsicologoPorUsuarioId } from '../Api/api_psicologo';

export default function Usuarios() {
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    const cargarEstudiantesRelacionados = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("usuario"));
        if (!userData) return;

        const { psicologo_id } = await buscarPsicologoPorUsuarioId(userData.id);
        
        const data = await listarEstudiantesRelacionados(psicologo_id);
        setEstudiantes(data);
      } catch (error) {
        console.error("❌ Error al cargar estudiantes relacionados:", error);
      }
    };

    cargarEstudiantesRelacionados();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="text-primary fw-bold mb-3">Estudiantes del Psicologo</h3>
      {estudiantes.length > 0 ? (
        <ul className="list-group">
          {estudiantes.map((est) => (
            <li key={est.estudiante_id} className="list-group-item">
              <strong>{est.nombre} {est.apellido}</strong><br />
              <small className="text-muted">{est.correo}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No hay estudiantes asignados todavía.</p>
      )}
    </div>
  );
}