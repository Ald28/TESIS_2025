import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Registro de psicólogo
export const registroPsicologo = async (datos) => {
  try {
    const response = await axios.post(`${API_URL}/registro_psicologo`, datos);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Verificación de código
export const verificarCodigo = async ({email, numero_colegiatura, codigo}) => {
  try {
    const response = await axios.post(`${API_URL}/verificar_codigo`, { 
      email, 
      numero_colegiatura, 
      codigo
     });
    return response.data;
  } catch (error) {
    console.error("Error en la API de verificación:", error);
    throw error.response ? error.response.data : error;
  }
};

// Login de psicólogo
export const loginPsicologo = async (credenciales) => {
  try {
    const response = await axios.post(`${API_URL}/login_psicologo`, credenciales);
    return response.data;
  } catch (error) {
    console.error("Error en la API de login:", error.response?.data || error);
    throw error.response ? error.response.data : error;
  }
};
