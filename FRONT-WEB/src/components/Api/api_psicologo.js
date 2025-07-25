import axios from "axios";

const API = import.meta.env.VITE_API_BASE +"/auth/psicologo";
const API_ADMIN = import.meta.env.VITE_API_BASE +"/auth/admin";

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
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API}/perfil/${usuario_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.perfil;
  } catch (error) {
    console.error("Error al obtener perfil del psicólogo:", error);
    throw error;
  }
};

export const obtenerHistorial = async (estudiante_id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API}/historial-canceladas/${estudiante_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener el historial del estudiante:", error);
    throw error;
  }
};

export const crearDisponibilidadPsicologo = async (data, token) => {
  try {
    const response = await axios.post(`${API}/disponibilidad/crear`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al crear disponibilidad:", error.response?.data || error.message);
    throw error;
  }
};

export const actualizarDisponibilidad = async (id, datos, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API}/disponibilidad/editar/${id}`, datos, config);
  return response.data;
};

export const eliminarDisponibilidadPorTurno = async (dia, turno, token) => {
  try {
    const response = await axios.delete(`${API}/disponibilidad/eliminar/${dia}/${turno}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al eliminar disponibilidad:", error.response?.data || error.message);
    throw error;
  }
};

export const verificarConexionCalendar = async (psicologo_id) => {
  try {
    const res = await fetch(`${API}/calendar-verificar/${psicologo_id}`);
    const data = await res.json();
    return data.conectado;
  } catch (error) {
    console.error("Error al verificar conexión con Google Calendar:", error.message);
    return false;
  }
};