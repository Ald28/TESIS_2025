import axios from 'axios';

const API_URL = 'http://localhost:8080/api/metodos_relajacion';

export const subirMetodoRelajacion = async (titulo, descripcion, psicologo_id, categoria_id, archivo) => {
  const formData = new FormData();

  formData.append('titulo', titulo);
  formData.append('descripcion', descripcion);
  formData.append('psicologo_id', psicologo_id);
  formData.append('categoria_id', categoria_id);
  formData.append('archivo', archivo);

  const token = localStorage.getItem('token'); // <-- Aquí lo obtienes

  try {
    const response = await axios.post(`${API_URL}/subir`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` // <-- Aquí lo envías al backend
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al subir el método de relajación", error);
    throw new Error("No se pudo subir el método de relajación");
  }
};