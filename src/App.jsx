import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Admin/Dashboard";
import Usuarios from "./components/Admin/Usuarios";
import Notificaciones from "./components/Admin/Notificaciones";
import PerfilDoctor from "./components/Admin/PerfilDoctor";
import NotFound from "./components/Common/NotFound";
import Cuestionario from "./components/Admin/Cuestionario";
import Metodos from "./components/Admin/Metodos";
import Citas from "./components/Admin/Citas";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
        <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas privadas bajo Layout */}
        <Route path="/admin" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="cuestionarios" element={<Cuestionario />} />
          <Route path="metodos" element={<Metodos />} />
          <Route path="citas" element={<Citas />} />
          <Route path="perfil" element={<PerfilDoctor />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Ruta 404 general */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;