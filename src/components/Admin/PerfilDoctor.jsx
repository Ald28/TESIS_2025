import React, { useEffect, useState } from "react";
import { obtenerPerfilPsicologo } from "../Api/api_psicologo";

const PerfilDoctor = () => {
  const [perfil, setPerfil] = useState(null);
  const usuario_id = JSON.parse(localStorage.getItem("usuario"))?.id;

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfilPsicologo(usuario_id);
        setPerfil(data);
      } catch (error) {
        console.error("Error al cargar perfil del psicólogo:", error);
      }
    };

    if (usuario_id) cargarPerfil();
  }, [usuario_id]);

  if (!perfil) return <p style={{ textAlign: "center" }}>Cargando perfil...</p>;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "40px auto",
        backgroundColor: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
        display: "flex",
        gap: "20px",
      }}
    >
      {/* Sección de imagen */}
      <div style={{ flex: "1", textAlign: "center" }}>
        <img
          src={perfil.foto_url || "/src/assets/images/doctor-login.jpg"}
          alt="Doctor"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid #007bff",
            marginBottom: "10px",
          }}
        />
        <button
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
          onClick={() => alert("Subir nueva imagen en desarrollo.")}
        >
          Cambiar Imagen
        </button>
      </div>

      {/* Sección de información */}
      <div style={{ flex: "2", padding: "10px 20px" }}>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "20px",
            color: "#333",
            borderBottom: "2px solid #007bff",
            display: "inline-block",
          }}
        >
          Perfil del Doctor
        </h1>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Nombre:</strong>{" "}
          <span style={{ color: "#333" }}>
            {perfil.nombre} {perfil.apellido}
          </span>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Email:</strong>{" "}
          <span style={{ color: "#333" }}>{perfil.correo}</span>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Especialidad:</strong>{" "}
          <span style={{ color: "#333" }}>{perfil.especialidad}</span>
        </div>
        <div>
          <strong style={{ color: "#555" }}>Descripción:</strong>
          <p style={{ color: "#333", lineHeight: "1.5", marginTop: "5px" }}>
            {perfil.descripcion}
          </p>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Fecha de Registro:</strong>{" "}
          <span style={{ color: "#333" }}>
            {new Date(perfil.fecha_registro).toLocaleDateString()}
          </span>
        </div>
        <button
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => alert("Editar perfil en desarrollo.")}
        >
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default PerfilDoctor;