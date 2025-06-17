import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginPsicologo } from "../Api/api_psicologo";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
const loginImage = new URL("../../assets/images/doctor-login.jpg", import.meta.url).href;
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
      localStorage.setItem("isAuthenticated", "true");

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
    <div className="auth-container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="card p-4" style={{ maxWidth: "900px", width: "100%", borderRadius: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <div className="row g-0">
          <div className="col-md-5 d-none d-md-flex align-items-center justify-content-center p-3">
            <img
              src={loginImage}
              alt="Login visual"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "15px" }}
            />
          </div>
          <div className="col-md-7 d-flex flex-column justify-content-center p-4">
            <h2 className="text-center mb-4" style={{ color: "#6c63ff", fontWeight: "700" }}>Bienvenido</h2>

            <form style={{ width: "100%" }}>
              <div className="form-group mb-3">
                <label>Email</label>
                <input type="email" className="form-control" placeholder="Correo electrónico" />
              </div>

              <div className="form-group mb-3">
                <label>Contraseña</label>
                <input type="password" className="form-control" placeholder="Contraseña" />
              </div>

              <div className="form-check mb-3">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">Recordarme</label>
              </div>

              <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: "#6c63ff", border: "none" }}>
                Iniciar sesión
              </button>

              <div className="text-center mt-3">
                <a href="/forgot-password" style={{ fontSize: "0.9rem" }}>¿Olvidaste tu contraseña?</a>
              </div>
            </form>

            <div className="text-center mt-4">
              ¿No tienes una cuenta? <a href="/register" style={{ color: "#6c63ff", fontWeight: "bold" }}>Regístrate</a>
            </div>

            <div className="text-center mb-3">─ O ─</div>

            <div id="googleBtn" style={{ width: "100%", marginBottom: "20px" }}></div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;