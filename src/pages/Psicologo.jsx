import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getPsicologos,
  registrarPsicologo,
  eliminarPsicologo,
  activarPsicologo,
} from "../api/api_admin";
import { FaUserMd, FaPlus, FaTimes } from "react-icons/fa";
import "../styles/Psicologo.css";

export default function Psicologo() {
  const [psicologos, setPsicologos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("activo");
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [nuevoPsicologo, setNuevoPsicologo] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    especialidad: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchData(estadoFiltro);
  }, [estadoFiltro]);

  const fetchData = async (estado = "activo") => {
    try {
      const data = await getPsicologos(estado);
      setPsicologos(data);
    } catch (error) {
      console.error("Error cargando psicólogos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrarPsicologo(nuevoPsicologo);
      await fetchData(estadoFiltro);

      setNuevoPsicologo({
        nombre: "",
        apellido: "",
        correo: "",
        especialidad: "",
        descripcion: "",
      });
      setMostrarPanel(false);
    } catch (error) {
      console.error("Error al registrar psicólogo:", error.message);
      alert("Error al registrar psicólogo: " + error.message);
    }
  };

  const onEliminar = async (usuario_id) => {
    try {
      await eliminarPsicologo(usuario_id);
      await fetchData(estadoFiltro);
      alert("✅ Psicólogo eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar psicólogo:", error.message);
      alert("❌ Error al eliminar psicólogo.");
    }
  };

  const onActivar = async (usuario_id) => {
    try {
      await activarPsicologo(usuario_id);
      await fetchData(estadoFiltro);
      alert("✅ Psicólogo activado correctamente.");
    } catch (error) {
      console.error("Error al activar psicólogo:", error.message);
      alert("❌ Error al activar psicólogo.");
    }
  };

  return (
    <MainLayout>
      <div className="psicologos-container">
        <div className="header d-flex justify-content-between align-items-center">
          <div>
            <h2 className="title">Psicólogos</h2>
            <p className="subtitle">
              Gestiona a los psicólogos registrados en el sistema
            </p>
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <button className="add-button" onClick={() => setMostrarPanel(true)}>
              <FaPlus className="me-2" /> Nuevo Psicólogo
            </button>
          </div>
        </div>

        {/* Tabla de psicólogos */}
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {psicologos.map((psic) => (
                <tr key={psic.usuario_id}>
                  <td className="user-info">
                    <img
                      src={psic.foto || ""}
                      alt="Foto del psicólogo"
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="name">
                        Dr. {psic.nombre} {psic.apellido}
                      </div>
                      <div className="email">{psic.correo}</div>
                    </div>
                  </td>
                  <td>{psic.especialidad}</td>
                  <td>{psic.descripcion}</td>
                  <td>
                    <span
                      className={`status-badge ${psic.estado === "activo" ? "active" : "inactive"
                        }`}
                    >
                      {psic.estado}
                    </span>
                  </td>
                  <td className="d-flex gap-2">
                    {psic.estado === "activo" ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onEditar(psic)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Estás seguro de eliminar este psicólogo?"
                              )
                            ) {
                              onEliminar(psic.usuario_id);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => onActivar(psic.usuario_id)}
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel lateral para registrar */}
      <div className={`side-panel ${mostrarPanel ? "open" : ""}`}>
        <div className="panel-header">
          <h4>Registrar Psicólogo</h4>
          <button
            className="close-btn"
            onClick={() => setMostrarPanel(false)}
          >
            <FaTimes />
          </button>
        </div>
        <form className="modal-form p-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoPsicologo.nombre}
            onChange={(e) =>
              setNuevoPsicologo({ ...nuevoPsicologo, nombre: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={nuevoPsicologo.apellido}
            onChange={(e) =>
              setNuevoPsicologo({
                ...nuevoPsicologo,
                apellido: e.target.value,
              })
            }
            required
          />
          <input
            type="email"
            placeholder="Correo"
            value={nuevoPsicologo.correo}
            onChange={(e) =>
              setNuevoPsicologo({ ...nuevoPsicologo, correo: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Especialidad"
            value={nuevoPsicologo.especialidad}
            onChange={(e) =>
              setNuevoPsicologo({
                ...nuevoPsicologo,
                especialidad: e.target.value,
              })
            }
          />
          <textarea
            placeholder="Descripción"
            value={nuevoPsicologo.descripcion}
            onChange={(e) =>
              setNuevoPsicologo({
                ...nuevoPsicologo,
                descripcion: e.target.value,
              })
            }
          />
          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="add-button">
              Guardar
            </button>
            <button
              type="button"
              className="btn-more"
              onClick={() => setMostrarPanel(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}