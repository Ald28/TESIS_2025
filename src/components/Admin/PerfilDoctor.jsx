// src/components/Admin/PerfilDoctor.jsx
import React from "react";

const PerfilDoctor = () => {
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
      <div
        style={{
          flex: "1",
          textAlign: "center",
        }}
      >
        <img
          src="/src/assets/images/doctor-login.jpg" // Cambia esto por una ruta válida de la imagen del doctor
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
      <div
        style={{
          flex: "2",
          padding: "10px 20px",
        }}
      >
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
          <span style={{ color: "#333" }}>Dr. Juan Pérez</span>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Especialidad:</strong>{" "}
          <span style={{ color: "#333" }}>Cardiología</span>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Email:</strong>{" "}
          <span style={{ color: "#333" }}>juan.perez@hospital.com</span>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <strong style={{ color: "#555" }}>Teléfono:</strong>{" "}
          <span style={{ color: "#333" }}>+51 987 654 321</span>
        </div>
        <div>
          <strong style={{ color: "#555" }}>Descripción:</strong>
          <p style={{ color: "#333", lineHeight: "1.5", marginTop: "5px" }}>
            Doctor con más de 10 años de experiencia en el campo de la cardiología. Comprometido con la atención de sus pacientes y la investigación médica.
          </p>
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
