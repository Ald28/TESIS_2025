import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Admin/Dashboard";
import Usuarios from "./components/Admin/Usuarios";
import Ajustes from "./components/Admin/Ajustes";
import PerfilDoctor from "./components/Admin/PerfilDoctor";
import VerificarCodigo from "./components/Auth/VerificarCodigo";
import NotFound from "./components/Common/NotFound";
import "./index.css";
import Cuestionario from "./components/Admin/Cuestionario";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verificar-codigo" element={<VerificarCodigo />} />
        
        <Route
          path="/admin/*"
          element={
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="ajustes" element={<Ajustes />} />
                <Route path="cuestionarios" element={<Cuestionario />} />
                <Route path="perfil" element={<PerfilDoctor />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
