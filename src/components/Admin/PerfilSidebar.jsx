import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Badge } from "react-bootstrap";
import { obtenerPerfilPsicologo, obtenerCitasDelPsicologo } from "../Api/api_psicologo";

const PerfilSidebar = ({ show, onHide }) => {
  const [perfil, setPerfil] = useState(null);
  const [sesionesRealizadas, setSesionesRealizadas] = useState(0);
  const [pacientesActivos, setPacientesActivos] = useState(0);

  useEffect(() => {
    if (!show) return;

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (usuario?.id && token) {
      obtenerPerfilPsicologo(usuario.id)
        .then((data) => setPerfil(data))
        .catch((err) =>
          console.error("Error al cargar perfil del psicólogo:", err)
        );

      obtenerCitasDelPsicologo(token)
        .then((res) => {
          const citas = res.citas || [];

          setSesionesRealizadas(citas.length);

          const pacientesUnicos = new Set(
            citas
              .filter((cita) => cita.estado === "aceptada")
              .map((cita) => cita.estudiante_id)
          );
          setPacientesActivos(pacientesUnicos.size);
        })
        .catch((err) =>
          console.error("Error al cargar citas del psicólogo:", err)
        );
    }
  }, [show]);

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      backdrop="static"
      style={{ width: "400px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title
          className="fw-bold"
          style={{
            fontSize: "1.3rem",
            background: "rgba(var(--bs-primary-rgb), 0.8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Perfil del Psicólogo
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="px-4 text-center">
        {!perfil ? (
          <p className="text-center">Cargando perfil...</p>
        ) : (
          <>
            {perfil.foto_url ? (
              <img
                src={perfil.foto_url}
                alt="Foto del psicólogo"
                className="rounded-circle shadow mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className="mx-auto mb-3 d-flex justify-content-center align-items-center bg-primary text-white rounded-circle shadow"
                style={{
                  width: "100px",
                  height: "100px",
                  fontSize: "2.8rem",
                  fontWeight: "bold",
                  userSelect: "none"
                }}
              >
                {perfil.nombre?.charAt(0)}
              </div>
            )}

            <h5 className="fw-bold mb-0">
              {perfil.nombre} {perfil.apellido}
            </h5>
            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>{perfil.correo}</p>

            <Badge bg="success" className="mb-4 py-2 px-3 rounded-pill">
              <span style={{ fontWeight: 500 }}>● {perfil.estado}</span>
            </Badge>

            <div className="bg-white rounded-4 shadow-sm p-3 text-start border">
              {[
                { label: "Especialidad", value: perfil.especialidad || "No especificada" },
                { label: "Descripción", value: perfil.descripcion || "Sin descripción" },
                {
                  label: "Fecha de Registro",
                  value: new Date(perfil.fecha_registro).toLocaleDateString()
                },
                { label: "Pacientes Activos", value: pacientesActivos },
                { label: "Sesiones Realizadas", value: sesionesRealizadas }
              ].map((item, index, arr) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center py-2"
                  style={{
                    borderBottom: index < arr.length - 1 ? "1px solid #eee" : "none"
                  }}
                >
                  <span className="fw-semibold">{item.label}:</span>
                  <span className="text-muted">{item.value}</span>
                </div>
              ))}
            </div>

            <Button
              variant="success"
              className="mt-4 w-100 py-2 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={() => alert("Editar perfil en desarrollo.")}
            >
              <i className="bi bi-pencil-square"></i> Editar Perfil
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default PerfilSidebar;