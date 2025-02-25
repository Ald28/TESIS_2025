import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPsicologo } from "../Api/api_psicologo";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginPsicologo({ email, contraseña });

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("usuario", JSON.stringify(response.usuario));

        Swal.fire({
          title: "¡Bienvenido!",
          text: `Hola, ${response.usuario.nombre}. Has iniciado sesión correctamente.`,
          icon: "success",
          confirmButtonText: "Continuar"
        }).then(() => {
          navigate("admin/dashboard");
        });

      } else {
        Swal.fire({
          title: "Error",
          text: response.message || "Correo o contraseña incorrectos.",
          icon: "error",
          confirmButtonText: "Aceptar"
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Correo o contraseña incorrectos.",
        icon: "error",
        confirmButtonText: "Aceptar"
      });
    }
  };

  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-10">
      <div className="card shadow-lg p-4" style={{ maxWidth: "1000px", width: "100%" }}>
        <h2 className="text-center text-primary mb-4">Inicio de Sesión</h2>
        <div className="row g-4">
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <img
              src="/src/assets/images/doctor-login.jpg"
              alt="Inicio de sesión"
              className="img-fluid rounded"
              style={{ height: "500px", objectFit: "cover" }}
            />
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
            <form onSubmit={handleSubmit} className="w-100 text-center">
              <img
                src="/src/assets/images/icon.png"
                alt="Icono"
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
              <div className="mb-3 text-center">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control text-center"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 text-center">
                <label htmlFor="contraseña" className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control text-center"
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
        </div>
      </div>
    </div>
  );
};

export default Login;
