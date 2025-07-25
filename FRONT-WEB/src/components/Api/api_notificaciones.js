import axios from 'axios';

const API = import.meta.env.VITE_API_BASE +'/api/notificaciones';

export const guardarTokenFCM = async (datos, token) => {
  try {
    const yaExiste = await verificarTokenFCM(datos.token);
    if (yaExiste) {
      return { message: "Token ya registrado." };
    }

    const res = await axios.post(`${API}/guardar-token-fcm`, datos, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error al guardar token en backend:", error.response?.data || error.message);
    throw error;
  }
};

export const verificarTokenFCM = async (token) => {
  try {
    const res = await axios.get(`${API}/verificar-token-fcm/${token}`);
    return res.data.existe;
  } catch (error) {
    console.error("❌ Error al verificar token:", error.response?.data || error.message);
    return false;
  }
};

export const listarNotificacionesPorUsuario = async (usuario_id) => {
  try {
    const res = await axios.get(`${API}/listar/${usuario_id}`);
    return res.data.notificaciones;
  } catch (error) {
    console.error("❌ Error al listar notificaciones:", error.response?.data || error.message);
    return [];
  }
};

export const eliminarNotificacionPorId = async (id) => {
  try {
    const res = await axios.delete(`${API}/eliminar/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error al eliminar notificación:", error.response?.data || error.message);
    throw error;
  }
};

export const revisarInactividadEstudiantes = async () => {
  try {
    const res = await axios.get(`${API}/revisar-inactividad`);
    return res.data;
  } catch (error) {
    console.error("❌ Error al revisar inactividad:", error.response?.data || error.message);
    throw error;
  }
};

export const notificarCitasProximas = async () => {
  try {
    const res = await axios.get(`${API}/notificar-citas-proximas`);
    return res.data;
  } catch (error) {
    console.error("❌ Error al notificar citas próximas:", error.response?.data || error.message);
    throw error;
  }
};