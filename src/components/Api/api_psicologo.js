import axios from "axios";

const API = "http://localhost:8080/auth/psicologo";
const API_ADMIN = "http://localhost:8080/auth/admin";

export const loginPsicologo = async (credential) => {
  try {
    const response = await fetch(`${API}/google/psicologo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Error en login");

    return data;
  } catch (error) {
    throw error;
  }
};

export const obtenerCitasDelPsicologo = async (token) => {
  const response = await axios.get(`${API}/citas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const cambiarEstadoCita = async ({ cita_id, estado, evento_google_id }, token) => {
  const response = await axios.put(
    `${API}/citas/estado`,
    { cita_id, estado, evento_google_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const conectarGoogleCalendar = () => {
  const calendarWindow = window.open(
    `${API}/google/calendar-login`,
    '_blank',
    'width=500,height=600'
  );

  const checkClosed = setInterval(() => {
    if (calendarWindow.closed) {
      clearInterval(checkClosed);
      window.dispatchEvent(new CustomEvent('calendar-connected'));
    }
  }, 500);
};

export const buscarPsicologoPorUsuarioId = async (usuario_id) => {
  const response = await axios.get(`${API}/buscar-psicologo/${usuario_id}`);
  return response.data;
};

export const obtenerDisponibilidadPsicologo = async (id) => {
  const response = await axios.get(`${API}/disponibilidad/${id}`);
  return response.data;
};

export const obtenerDisponibilidadPorTurno = async (psicologo_id) => {
  try {
    const response = await axios.get(`${API_ADMIN}/disponibilidad/turnos/${psicologo_id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener disponibilidad por turnos:", error);
    throw error;
  }
};

export const obtenerPerfilPsicologo = async (usuario_id) => {
  try {
    const response = await axios.get(`${API}/perfil/${usuario_id}`);
    return response.data.perfil;
  } catch (error) {
    console.error("Error al obtener perfil del psicólogo:", error);
    throw error;
  }
};