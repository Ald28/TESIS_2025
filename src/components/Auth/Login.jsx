import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginPsicologo } from "../Api/api_psicologo";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const Login = () => {
  const navigate = useNavigate();

  const handleCallbackResponse = async (response) => {
    try {
      const credential = response.credential;
      const data = await loginPsicologo(credential);

      Swal.fire({
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 2000,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/admin/dashboard");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  };

  useEffect(() => {
    // Inicializar Google Login
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large", width: "100%" }
    );
  }, []);

  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-80">
      <div className="card shadow-lg p-5" style={{ maxWidth: "1200px", width: "100%" }}>
        <h2 className="text-center text-primary mb-5">Inicio de Sesión</h2>

        <div className="row g-5">
          {/* Imagen a la izquierda */}
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <img
              src="/src/assets/images/doctor-login.jpg"
              alt="Login"
              className="img-fluid rounded"
              style={{ height: "500px", width: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Botón de Google a la derecha */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
            <img
              src="/src/assets/images/icon.png"
              alt="Icono"
              style={{
                borderRadius: "50%",
                width: "120px",
                height: "120px",
                objectFit: "cover",
                marginBottom: "20px",
              }}
            />
            <div id="googleBtn" style={{ width: "100%", marginBottom: "20px" }}></div>

            <div className="text-center mt-3">
              <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
