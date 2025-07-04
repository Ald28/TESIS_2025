import React, { useEffect, useState } from "react";
import { Offcanvas, Button, Badge, Form } from "react-bootstrap";
import { obtenerPerfilPsicologo, obtenerCitasDelPsicologo } from "../Api/api_psicologo";
import { editarPsicologo } from "../Api/api_admin";
import { toast } from "react-toastify";


const PerfilSidebar = ({ show, onHide }) => {
  const [perfil, setPerfil] = useState(null);
  const [sesionesRealizadas, setSesionesRealizadas] = useState(0);
  const [pacientesActivos, setPacientesActivos] = useState(0);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    especialidad: "",
    descripcion: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (!show) return;

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (usuario?.id && token) {
      obtenerPerfilPsicologo(usuario.id)
        .then((data) => {
          setPerfil(data);
          setFormData({
            especialidad: data.especialidad || "",
            descripcion: data.descripcion || ""
          });
        })
        .catch((err) =>
          console.error("Error al cargar perfil del psicólogo:", err)
        );

      obtenerCitasDelPsicologo(token)
        .then((res) => {
          const citas = res.citas || [];
          setSesionesRealizadas(citas.length);
          const pacientesUnicos = new Set(
            citas.filter((cita) => cita.estado === "aceptada").map((cita) => cita.estudiante_id)
          );
          setPacientesActivos(pacientesUnicos.size);
        })
        .catch((err) =>
          console.error("Error al cargar citas del psicólogo:", err)
        );
    }
  }, [show]);

  const handleGuardar = async () => {
    try {
      const dataEnviar = {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        correo: perfil.correo,
        especialidad: formData.especialidad,
        descripcion: formData.descripcion
      };

      await editarPsicologo(perfil.usuario_id, dataEnviar);
      setModoEdicion(false);
      toast.success("Perfil actualizado correctamente");

      const dataActualizado = await obtenerPerfilPsicologo(perfil.usuario_id);
      setPerfil(dataActualizado);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el perfil");
    }
  };

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

            <div className="bg-white rounded-4 text-start border p-4">
              {
                modoEdicion ? (
                  <Form>
                    <Form.Group className="mb-4" controlId="formEspecialidad">
                      <Form.Label className="fw-semibold">Especialidad</Form.Label>
                      <Form.Control
                        type="text"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        className="rounded-3 px-3 py-2"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="formDescripcion">
                      <Form.Label className="fw-semibold">Descripción</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="rounded-3 px-3 py-2"
                      />
                    </Form.Group>
                  </Form>
                ) : (
                  <div className="p-1 text-start">
                    <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #eee" }}>
                      <span className="fw-semibold">Especialidad:</span>
                      <span className="text-muted">{perfil.especialidad || "No especificada"}</span>
                    </div>

                    <div className="py-2" style={{ borderBottom: "1px solid #eee" }}>
                      <span className="fw-semibold">Descripción:</span>
                      <p className="text-muted mb-0 mt-1" style={{ whiteSpace: "pre-line" }}>
                        {perfil.descripcion || "Sin descripción"}
                      </p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #eee" }}>
                      <span className="fw-semibold">Fecha de Registro:</span>
                      <span className="text-muted">{new Date(perfil.fecha_registro).toLocaleDateString()}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #eee" }}>
                      <span className="fw-semibold">Pacientes Activos:</span>
                      <span className="text-muted">{pacientesActivos}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center py-2">
                      <span className="fw-semibold">Sesiones Realizadas:</span>
                      <span className="text-muted">{sesionesRealizadas}</span>
                    </div>
                  </div>
                )
              }
            </div>

            <Button
              variant={modoEdicion ? "primary" : "success"}
              className="mt-4 w-100 py-2 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={modoEdicion ? handleGuardar : () => setModoEdicion(true)}
            >
              <i className="bi bi-pencil-square"></i> {modoEdicion ? "Guardar Cambios" : "Editar Perfil"}
            </Button>
            {modoEdicion && (
              <Button
                variant="secondary"
                className="mt-2 w-100 py-2 rounded-pill fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  setModoEdicion(false);
                  setFormData({
                    especialidad: perfil.especialidad || "",
                    descripcion: perfil.descripcion || ""
                  });
                }}
              >
                <i className="bi bi-x-circle"></i> Cancelar
              </Button>
            )}
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default PerfilSidebar;