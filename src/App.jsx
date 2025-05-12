import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Estudent from "./pages/Estudent";
import Psicologo from "./pages/Psicologo";
import Dashboard from "./pages/Dashboard";
import Disponibilidad from "./pages/Disponibilidad";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/estudiantes" element={
            <ProtectedRoute>
              <Estudent />
            </ProtectedRoute>
          } />
          <Route path="/psicologos" element={
            <ProtectedRoute>
              <Psicologo />
            </ProtectedRoute>
          } />
          <Route path="/disponibilidad" element={
            <ProtectedRoute>
              <Disponibilidad />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;