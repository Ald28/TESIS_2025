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

      // Guardar en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Redirigir al dashboard
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
    // Inicializar el login de Google
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
    <div className="container mt-5">
      <h2>Login Psicólogo</h2>
      <div id="googleBtn" className="mt-3"></div>
    </div>
  );
};

export default Login;
