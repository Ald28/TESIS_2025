import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { loginPsicologo } from "../Api/api_psicologo";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Datos enviados:", { email, contraseña });

    try {
      const response = await loginPsicologo({ email, contraseña });

      if (response.token) {
        // Guardar datos del usuario en localStorage o contexto global
        localStorage.setItem("token", response.token);
        localStorage.setItem("usuario", JSON.stringify(response.usuario));
        // Redirigir al Dashboard
        navigate("admin/dashboard");
      } else {
        setError(response.message || "Error en la autenticación.");
      }
    } catch (error) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "1000px", width: "100%" }}>
        <div className="row g-4">
          <div className="col-md-6">
            <h2 className="text-center text-primary mb-4">Inicio de Sesión</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contraseña" className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
              <div className="text-center mt-3">
                <a href="/register">Registrarse</a>
              </div>
            </form>
          </div>
          
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <img
              src="/src/assets/images/doctor-login.jpg"
              alt="Inicio de sesión"
              className="img-fluid rounded"
              style={{ height: "400px", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
