import axios from "axios";

const API = "http://localhost:8080/auth";

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

export const crearDisponibilidad = async (disponibilidad) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API}/disponibilidad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(disponibilidad),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear disponibilidad");
  }

  return await response.json();
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
  const response = await axios.get(`http://localhost:8080/auth/buscar-psicologo/${usuario_id}`);
  return response.data;
};