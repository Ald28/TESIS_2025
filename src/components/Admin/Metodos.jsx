import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ClipboardList, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaTasks } from "react-icons/fa";
import {
  subirMetodo,
  listarEstudiantes,
  listarMetodosRecomendados,
  listarTodosMetodosPrivados,
  editarMetodo,
  eliminarMetodo,
} from '../Api/api_metodos';

export default function Metodos() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('recomendado');
  const [estudianteId, setEstudianteId] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [metodosRecomendados, setMetodosRecomendados] = useState([]);
  const [todosMetodosPrivados, setTodosMetodosPrivados] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tabActivo, setTabActivo] = useState('recomendados');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  const [modalArchivoVisible, setModalArchivoVisible] = useState(false);
  const [archivoActual, setArchivoActual] = useState(null);

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

    if (!archivo && !modoEdicion) {
      toast.warn('Selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('tipo', tipo);

    if (tipo === 'privado') {
      formData.append('estudiante_id', estudianteId);
    }

    if (archivo) {
      formData.append('archivo', archivo);
    }

    try {
      let response;

      if (modoEdicion) {
        response = await editarMetodo(idEditar, formData);
        toast.success('Método actualizado correctamente');
      } else {
        response = await subirMetodo(formData);
        toast.success('Método subido correctamente');
      }

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setTipo('recomendado');
      setEstudianteId('');
      setArchivo(null);
      setMostrarModal(false);
      setModoEdicion(false);
      setIdEditar(null);

      // Recargar listas
      const recomendadosData = await listarMetodosRecomendados();
      setMetodosRecomendados(recomendadosData);
      const privadosData = await listarTodosMetodosPrivados();
      setTodosMetodosPrivados(privadosData);
    } catch (error) {
      toast.error('Ocurrió un error al guardar el método.');
      console.error(error);
    }
  };

  const abrirModalArchivo = (url) => {
    setArchivoActual(url);
    setModalArchivoVisible(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este método será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await eliminarMetodo(id);
      toast.success(response.message);

      const recomendadosData = await listarMetodosRecomendados();
      setMetodosRecomendados(recomendadosData);
      const privadosData = await listarTodosMetodosPrivados();
      setTodosMetodosPrivados(privadosData);
    } catch (error) {
      toast.error('Ocurrió un error al eliminar el método.');
    }
  };

  return (
    <div className="container py-3">
      <h1 className="mb-4 fw-bold text-primary d-flex align-items-center justify-content-center gap-2">
        <FaTasks size={28} />
        <span>Panel de Administración de Actividades</span>
      </h1>

      <style>{`
        .btn-tab {
          min-width: 160px;
          text-align: left;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center border-bottom mb-4">
        <div className="d-flex" style={{ minWidth: '340px', gap: '1rem' }}>
          <button
            className={`btn border-0 rounded-0 btn-tab ${tabActivo === "recomendados" ? "text-primary border-bottom border-3 border-primary fw-bold" : "text-muted"}`}
            onClick={() => setTabActivo("recomendados")}
          >
            <ClipboardList size={18} className="me-2" /> Recomendados
          </button>
          <button
            className={`btn border-0 rounded-0 btn-tab ${tabActivo === "privados" ? "text-primary border-bottom border-3 border-primary fw-bold" : "text-muted"}`}
            onClick={() => setTabActivo("privados")}
          >
            <ShieldCheck size={18} className="me-2" /> Privados
          </button>
        </div>

        <Button variant="primary" onClick={() => setMostrarModal(true)}>
          + Subir Actividad
        </Button>
      </div>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Title>
          {modoEdicion ? 'Editar Método' : 'Subir Nuevo Método'}
        </Modal.Title>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input type="text" className="form-control" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Tipo de método</label>
              <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                <option value="recomendado">Recomendado</option>
                <option value="privado">Privado</option>
              </select>
            </div>

            {tipo === 'privado' && (
              <div className="mb-3">
                <label className="form-label">Seleccionar Estudiante</label>
                <select className="form-select" value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required>
                  <option value="">Selecciona un estudiante</option>
                  {estudiantes.map((est) => (
                    <option key={est.estudiante_id} value={est.estudiante_id}>
                      {est.nombre} {est.apellido}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Archivo Multimedia</label>
              <input type="file" className="form-control" onChange={(e) => setArchivo(e.target.files[0])} required />
            </div>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setMostrarModal(false)} className="me-2">
                Cancelar
              </Button>
              <Button variant="success" type="submit">
                Subir Actividad
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={modalArchivoVisible} onHide={() => setModalArchivoVisible(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista del Archivo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
          {archivoActual ? (
            archivoActual.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
              <img
                src={archivoActual}
                alt="Vista del Archivo"
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  height: '500px',
                  objectFit: 'contain',
                  borderRadius: '10px'
                }}
              />
            ) : (
              <iframe
                src={archivoActual}
                title="Vista del Archivo"
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  height: '500px',
                  border: 'none',
                  borderRadius: '10px'
                }}
                allowFullScreen
              ></iframe>
            )
          ) : (
            <p>No hay archivo para mostrar.</p>
          )}
        </Modal.Body>
      </Modal>

      {tabActivo === "recomendados" ? (
        <div className="card shadow-sm p-4">
          <h3 className="text-center text-success"> Actividades Recomendadas</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-lg">
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
                      <td className="text-center">
                        {metodo.multimedia_url && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="mx-2"
                            onClick={() => abrirModalArchivo(metodo.multimedia_url)}
                          >
                            Ver Archivo
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mx-2"
                          onClick={() => {
                            setIdEditar(metodo.id);
                            setTitulo(metodo.titulo);
                            setDescripcion(metodo.descripcion);
                            setTipo(metodo.tipo);
                            setEstudianteId('');
                            setArchivo(null);
                            setModoEdicion(true);
                            setMostrarModal(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mx-2"
                          onClick={() => handleEliminar(metodo.id)}
                        >
                          Eliminar
                        </Button>
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
      ) : (
        <div className="card shadow-sm p-4">
          <h3 className="text-center text-danger"> Actividades Privadas Asignadas</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-lg">
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
                      <td className="d-flex justify-content-center gap-3">
                        {metodo.multimedia_url && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="mx-2"
                            onClick={() => abrirModalArchivo(metodo.multimedia_url)}
                          >
                            Ver Archivo
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mx-2"
                          onClick={() => {
                            setIdEditar(metodo.id);
                            setTitulo(metodo.titulo);
                            setDescripcion(metodo.descripcion);
                            setTipo(metodo.tipo);
                            setEstudianteId(metodo.estudiante_id || '');
                            setArchivo(null);
                            setModoEdicion(true);
                            setMostrarModal(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mx-2"
                          onClick={() => handleEliminar(metodo.id)}
                        >
                          Eliminar
                        </Button>
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
      )}
    </div>
  );
}