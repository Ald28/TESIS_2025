import axios from 'axios';

const API_URL = 'https://tesis-2025.onrender.com/api';
const API_ESTUDIANTE = 'https://tesis-2025.onrender.com/auth';

export const subirMetodo = async (formData) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.post(`${API_URL}/subir-metodo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al subir método:', error.response?.data || error.message);
    throw error;
  }
};

export const listarEstudiantes = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_ESTUDIANTE}/estudiantes`, {
      headers: {
        'Authorization': token,
      },
    });

    return response.data.estudiantes;
  } catch (error) {
    console.error('Error al listar estudiantes:', error.response?.data || error.message);
    throw error;
  }
};

export const listarMetodosRecomendados = async () => {
  try {
    const response = await axios.get(`${API_URL}/recomendados`);
    return response.data.metodos;
  } catch (error) {
    console.error('Error al listar métodos recomendados:', error.response?.data || error.message);
    throw error;
  }
};

export const listarTodosMetodosPrivados = async () => {
  try {
    const response = await axios.get(`${API_URL}/privados-todos`);
    return response.data.metodos;
  } catch (error) {
    console.error('Error al listar todos los métodos privados:', error.response?.data || error.message);
    throw error;
  }
};

export const editarMetodo = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.put(`${API_URL}/actividades/editar/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al editar método:', error.response?.data || error.message);
    throw error;
  }
};

export const eliminarMetodo = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/actividades/eliminar/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar método:', error.response?.data || error.message);
    throw error;
  }
};