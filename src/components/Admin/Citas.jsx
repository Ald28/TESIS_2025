import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { obtenerCitasAceptadas, cancelarCitaAceptada } from "../Api/api_citas";

export default function Citas() {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      obtenerCitasAceptadas(token)
        .then(setCitas)
        .catch((err) => {
          console.error("❌ Error al obtener citas aceptadas:", err);
        });
    }
  }, []);

  return (
    <div className="container mt-4">
      <h3>Citas Aceptadas</h3>

      <Table hover responsive borderless>
        <thead className="table-light">
          <tr>
            <th>Paciente</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citas.length > 0 ? (
            citas.map((cita, index) => (
              <tr key={index}>
                <td>
                  <strong>{cita.estudiante_nombre} {cita.estudiante_apellido}</strong><br />
                  <small className="text-muted">Estudiante</small>
                </td>
                <td>{new Date(cita.fecha_inicio).toLocaleDateString()}</td>
                <td>{new Date(cita.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td><span className="badge bg-success">Aceptada</span></td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={async () => {
                      const confirm = window.confirm("¿Estás seguro de cancelar esta cita?");
                      if (!confirm) return;

                      try {
                        const token = localStorage.getItem("token");
                        await cancelarCitaAceptada(token, cita.id);
                        // Actualizar la lista local
                        setCitas((prev) => prev.filter((c) => c.id !== cita.id));
                      } catch (error) {
                        console.error("❌ Error al cancelar cita:", error);
                        alert("Ocurrió un error al cancelar la cita.");
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No hay citas aceptadas.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}