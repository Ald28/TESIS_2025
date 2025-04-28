import React, { useState, useEffect } from 'react';
import { 
  subirMetodo, 
  listarEstudiantes, 
  listarMetodosRecomendados, 
  listarTodosMetodosPrivados
} from '../api/api_metodos';

export default function Metodos() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('recomendado');
  const [estudianteId, setEstudianteId] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);

  const [metodosRecomendados, setMetodosRecomendados] = useState([]);
  const [todosMetodosPrivados, setTodosMetodosPrivados] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const estudiantesData = await listarEstudiantes();
        setEstudiantes(estudiantesData);

        const recomendadosData = await listarMetodosRecomendados();
        setMetodosRecomendados(recomendadosData);

        const privadosData = await listarTodosMetodosPrivados();
        setTodosMetodosPrivados(privadosData);
      } catch (error) {
        console.error('Error inicial:', error);
      }
    };
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivo) {
      alert('Selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('tipo', tipo);
    if (tipo === 'privado') {
      formData.append('estudiante_id', estudianteId);
    }
    formData.append('archivo', archivo);

    try {
      const response = await subirMetodo(formData);
      alert(response.message);
      setTitulo('');
      setDescripcion('');
      setTipo('recomendado');
      setArchivo(null);
      setEstudianteId('');

      const recomendadosData = await listarMetodosRecomendados();
      setMetodosRecomendados(recomendadosData);

      const privadosData = await listarTodosMetodosPrivados();
      setTodosMetodosPrivados(privadosData);
    } catch (error) {
      alert('Error al subir el método');
    }
  };

  return (
    <div className="container mt-5">

      {/* Formulario */}
      <div className="card shadow-sm p-4">
        <h2 className="mb-4 text-center text-primary">Subir Método de Relajación</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Título</label>
            <input
              type="text"
              className="form-control"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              className="form-control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Tipo de método</label>
            <select
              className="form-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="recomendado">Recomendado</option>
              <option value="privado">Privado</option>
            </select>
          </div>

          {tipo === 'privado' && (
            <div className="mb-3">
              <label className="form-label">Seleccionar Estudiante</label>
              <select
                className="form-select"
                value={estudianteId}
                onChange={(e) => setEstudianteId(e.target.value)}
                required
              >
                <option value="">Selecciona un estudiante</option>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.estudiante_id} value={estudiante.estudiante_id}>
                    {estudiante.nombre} {estudiante.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Archivo Multimedia</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setArchivo(e.target.files[0])}
              required
            />
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary w-50">
              Subir Método
            </button>
          </div>
        </form>
      </div>

      {/* 🌟 Métodos Recomendados en Tabla */}
      <div className="card shadow-sm p-4 mt-5">
        <h3 className="text-center text-success">🌟 Métodos Recomendados</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Archivo Multimedia</th>
              </tr>
            </thead>
            <tbody>
              {metodosRecomendados.length > 0 ? (
                metodosRecomendados.map((metodo) => (
                  <tr key={metodo.id}>
                    <td>{metodo.titulo}</td>
                    <td>{metodo.descripcion}</td>
                    <td>
                      {metodo.multimedia_url && (
                        <a href={metodo.multimedia_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">
                          Ver Archivo
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No hay métodos recomendados disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔒 Métodos Privados en Tabla */}
      <div className="card shadow-sm p-4 mt-5">
        <h3 className="text-center text-danger">🔒 Métodos Privados Asignados</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Estudiante</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Archivo Multimedia</th>
              </tr>
            </thead>
            <tbody>
              {todosMetodosPrivados.length > 0 ? (
                todosMetodosPrivados.map((metodo) => (
                  <tr key={metodo.id}>
                    <td>{metodo.nombre} {metodo.apellido}</td>
                    <td>{metodo.titulo}</td>
                    <td>{metodo.descripcion}</td>
                    <td>
                      {metodo.multimedia_url && (
                        <a href={metodo.multimedia_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger btn-sm">
                          Ver Archivo
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No hay métodos privados asignados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
