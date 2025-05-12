import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/Disponibilidad.css";
import { getPsicologos, crearDisponibilidad } from "../api/api_admin";

export default function Disponibilidad() {
  const [psicologos, setPsicologos] = useState([]);
  const [selectedId, setSelectedId] = useState("-1");
  const [disponibilidad, setDisponibilidad] = useState({
    lunes: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
    martes: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
    miercoles: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
    jueves: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
    viernes: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
  });

  useEffect(() => {
    const cargarPsicologos = async () => {
      try {
        const data = await getPsicologos();
        setPsicologos(data);
      } catch (error) {
        console.error("Error al cargar psicólogos:", error);
      }
    };

    cargarPsicologos();
  }, []);

  const handleChange = (dia, turno, campo, valor) => {
    setDisponibilidad((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [turno]: {
          ...prev[dia][turno],
          [campo]: valor,
        },
      },
    }));
  };

  const idNumerico = parseInt(selectedId);
  const handleGuardar = async () => {
    if (selectedId === "-1" || isNaN(idNumerico)) {
      alert("Selecciona un psicólogo válido.");
      console.error("ID de psicólogo no válido:", selectedId);
      return;
    }

    try {
      for (const [dia, turnos] of Object.entries(disponibilidad)) {
        const payload = {
          dia,
          mañana_inicio: turnos.mañana.inicio,
          mañana_fin: turnos.mañana.fin,
          tarde_inicio: turnos.tarde.inicio,
          tarde_fin: turnos.tarde.fin,
          psicologo_id: parseInt(selectedId)
        };
        
        if (
          !payload.mañana_inicio ||
          !payload.mañana_fin ||
          !payload.tarde_inicio ||
          !payload.tarde_fin
        ) {
          alert(`Completa todos los campos para el día: ${dia}`);
          return;
        }

        await crearDisponibilidad(payload);
      }

      alert("✅ Disponibilidad registrada correctamente.");
    } catch (error) {
      console.error("❌ Error al guardar disponibilidad:", error);
      alert("❌ Error al guardar disponibilidad");
    }
  };

  return (
    <MainLayout>
      <div className="disponibilidad-container">
        <h2 className="mb-4">Disponibilidad de Psicólogos</h2>

        <div className="form-group mb-4">
          <label>Selecciona un Psicólogo:</label>
          <select
            className="form-control"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="-1">-- Selecciona --</option>
            {psicologos.map((psic) => (
              <option key={psic.psicologo_id} value={psic.psicologo_id.toString()}>
                {psic.nombre} {psic.apellido}
              </option>
            ))}
          </select>
        </div>

        {selectedId && (
          <div className="table-responsive">
            <table className="table table-bordered disponibilidad-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Turno</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(disponibilidad).map(([dia, turnos]) => (
                  ["mañana", "tarde"].map((turno) => (
                    <tr key={`${dia}-${turno}`}>
                      <td className="text-capitalize">{dia}</td>
                      <td className="text-capitalize">{turno}</td>
                      <td>
                        <input
                          type="time"
                          className="form-control"
                          value={turnos[turno].inicio}
                          onChange={(e) =>
                            handleChange(dia, turno, "inicio", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-control"
                          value={turnos[turno].fin}
                          onChange={(e) =>
                            handleChange(dia, turno, "fin", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary mt-3" onClick={handleGuardar}>
              Guardar Disponibilidad
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}