const API_URL = 'http://localhost:8080/api';

// Crear una calificación
export const crearCalificacion = async (calificacion) => {
    const response = await fetch(`${API_URL}/calificaciones/crear`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(calificacion)
    });

    if (!response.ok) {
        throw new Error('Error al crear calificación');
    }

    return await response.json();
};

// Obtener calificaciones de un estudiante
export const obtenerCalificacionesPorEstudiante = async (estudiante_id) => {
    const response = await fetch(`${API_URL}/calificaciones/estudiante/${estudiante_id}`);

    if (!response.ok) {
        throw new Error('Error al obtener calificaciones');
    }

    return await response.json();
};

export const editarCalificacion = async (id, datosActualizados) => {
    const response = await fetch(`${API_URL}/calificaciones/editar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al editar la calificación');
    }

    return await response.json();
};

export const eliminarCalificacion = async (id, psicologo_id) => {
  const response = await fetch(`${API_URL}/calificaciones/eliminar/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ psicologo_id })
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la calificación");
  }

  return await response.json();
};