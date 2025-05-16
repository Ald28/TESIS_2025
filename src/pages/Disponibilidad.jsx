import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/Disponibilidad.css";
import {
  getPsicologos,
  getDisponibilidadPorPsicologo,
} from "../api/api_admin";

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

  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (selectedId === "-1") return;

      try {
        const data = await getDisponibilidadPorPsicologo(selectedId);

        const nuevaDisponibilidad = {
          lunes: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
          martes: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
          miercoles: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
          jueves: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
          viernes: { mañana: { inicio: "", fin: "" }, tarde: { inicio: "", fin: "" } },
        };

        data.forEach((turno) => {
          const dia = turno.dia.toLowerCase();
          if (nuevaDisponibilidad[dia]) {
            const horaInicio = turno.hora_inicio?.substring(0, 5); // recorta HH:mm:ss
            const horaFin = turno.hora_fin?.substring(0, 5);
            const turnoHora = turno.hora_inicio < "13:00" ? "mañana" : "tarde";

            nuevaDisponibilidad[dia][turnoHora].inicio = horaInicio || "";
            nuevaDisponibilidad[dia][turnoHora].fin = horaFin || "";
          }
        });

        setDisponibilidad(nuevaDisponibilidad);
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
      }
    };

    cargarDisponibilidad();
  }, [selectedId]);

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

        {selectedId !== "-1" && (
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
                {Object.entries(disponibilidad).map(([dia, turnos]) =>
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
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}