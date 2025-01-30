// src/components/Common/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        color: "#343a40",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "5rem", marginBottom: "20px" }}>404</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "30px" }}>
        Lo sentimos, no pudimos encontrar la página que buscas.
      </p>
      <button
        onClick={redirectToLogin}
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Ir al inicio de sesión
      </button>
    </div>
  );
};

export default NotFound;
