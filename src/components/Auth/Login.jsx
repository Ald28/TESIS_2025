import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const Login = () => {
  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-10">
      <div className="card shadow-lg p-4" style={{ maxWidth: "1000px", width: "100%" }}>
        <div className="row g-4">
          <div className="col-md-6">
            <h2 className="text-center text-primary mb-4">Inicio de Sesión</h2>
            <form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <input type="email" className="form-control" id="email" required />
              </div>
              <div className="mb-3">
                <label htmlFor="contraseña" className="form-label">
                  Contraseña
                </label>
                <input type="password" className="form-control" id="contraseña" required />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Iniciar Sesión
              </button>
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