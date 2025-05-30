import React, { useEffect, useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { obtenerPerfilPsicologo } from "../Api/api_psicologo";

const PerfilSidebar = ({ show, onHide }) => {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    if (!show) return;

    const usuario_id = JSON.parse(localStorage.getItem("usuario"))?.id;
    if (usuario_id) {
      obtenerPerfilPsicologo(usuario_id)
        .then((data) => setPerfil(data))
        .catch((err) =>
          console.error("Error al cargar perfil del psicólogo:", err)
        );
    }
  }, [show]);

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      backdrop="static"
      style={{ width: "380px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-bold text-primary">
          Perfil del Psicólogo
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-4">
        {!perfil ? (
          <p className="text-center">Cargando perfil...</p>
        ) : (
          <div className="text-center">
            <div
              className="mx-auto mb-3 d-flex justify-content-center align-items-center bg-primary text-white rounded-circle"
              style={{
                width: "120px",
                height: "120px",
                fontSize: "3rem",
                fontWeight: "bold",
                userSelect: "none",
              }}
            >
              {perfil.nombre?.charAt(0)}
            </div>

            <h4 className="fw-semibold mb-1">
              {perfil.nombre} {perfil.apellido}
            </h4>
            <p className="text-muted mb-3">{perfil.correo}</p>

            <hr />

            <div className="text-start mb-3">
              <p className="mb-1">
                <strong>Especialidad:</strong><br />
                <span className="text-muted">{perfil.especialidad || "No especificada"}</span>
              </p>
              <p className="mb-1">
                <strong>Descripción:</strong><br />
                <span className="text-muted">{perfil.descripcion || "Sin descripción"}</span>
              </p>
              <p className="mb-1">
                <strong>Fecha de Registro:</strong><br />
                <span className="text-muted">
                  {new Date(perfil.fecha_registro).toLocaleDateString()}
                </span>
              </p>
            </div>

            <Button
              variant="success"
              size="sm"
              className="rounded-pill px-4"
              onClick={() => alert("Editar perfil en desarrollo.")}
            >
              Editar Perfil
            </Button>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default PerfilSidebar;