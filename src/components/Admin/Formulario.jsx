import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearPregunta, preguntaPorCuestionario } from "../Api/api_pregunta";
import { crearOpcion, obtenerOpcionesPorPregunta } from "../Api/api_opcion";

const Formulario = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [preguntasConOpciones, setPreguntasConOpciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOpcionVisible, setModalOpcionVisible] = useState(null);
  const [nuevaOpcion, setNuevaOpcion] = useState({ txt_opcion: "", puntaje: 0 });
  const [modalOpciones, setModalOpciones] = useState(null);

  const [cuestionarioId, setCuestionarioId] = useState(() => {
    return paramId || localStorage.getItem("cuestionario_id") || "";
  });

  useEffect(() => {
    if (paramId) {
      setCuestionarioId(paramId);
      localStorage.setItem("cuestionario_id", paramId);
    }
  }, [paramId]);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const psicologo_id = usuario?.psicologo_id;

  const agregarPregunta = () => {
    setPreguntas([
      ...preguntas,
      {
        id: preguntas.length + 1,
        txt_pregunta: "",
        tipo_pregunta: "",
        opciones: [],
        pregunta_id: null,
        guardado: false,
      },
    ]);
    setModalVisible(true);
  };

  const guardarPregunta = async (index) => {
    setMensaje("");
    const pregunta = preguntas[index];

    if (!pregunta.txt_pregunta || !pregunta.tipo_pregunta) {
      setMensaje("Cada pregunta debe tener texto y tipo.");
      return;
    }

    try {
      const response = await crearPregunta({
        txt_pregunta: pregunta.txt_pregunta,
        tipo_pregunta: pregunta.tipo_pregunta,
        cuestionario_id: cuestionarioId,
        psicologo_id: psicologo_id,
      });

      if (response.pregunta?.id) {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[index].pregunta_id = response.pregunta.id;
        nuevasPreguntas[index].guardado = true;
        setPreguntas(nuevasPreguntas);
        setMensaje("Pregunta guardada correctamente.");
        setModalVisible(false);
        obtenerPreguntasConOpciones();
      } else {
        setMensaje("Error: No se recibió un ID de la pregunta.");
      }
    } catch (error) {
      console.error("Error al guardar la pregunta:", error);
      setMensaje("Error al guardar la pregunta.");
    }
  };

  const guardarOpcion = async () => {
    setMensaje("");
    if (!nuevaOpcion.txt_opcion || nuevaOpcion.puntaje === null) {
      setMensaje("Cada opción debe tener texto y puntaje.");
      return;
    }

    try {
      await crearOpcion({
        txt_opcion: nuevaOpcion.txt_opcion,
        puntaje: nuevaOpcion.puntaje,
        pregunta_id: modalOpcionVisible,
        psicologo_id: psicologo_id,
      });

      setMensaje("Opción guardada correctamente.");
      setNuevaOpcion({ txt_opcion: "", puntaje: 0 });
      setModalOpcionVisible(null);
      obtenerPreguntasConOpciones();
    } catch {
      setMensaje("Error al guardar la opción.");
    }
  };

  const obtenerPreguntasConOpciones = async () => {
    try {
      setMensaje("");
      const preguntas = await preguntaPorCuestionario(cuestionarioId);

      const preguntasOpciones = await Promise.all(
        preguntas.map(async (pregunta) => {
          const opciones = await obtenerOpcionesPorPregunta(pregunta.id);
          return { ...pregunta, opciones };
        })
      );

      setPreguntasConOpciones(preguntasOpciones);
    } catch (error) {
      console.error("Error al obtener preguntas y opciones:", error);
      setMensaje("No se pudieron cargar las preguntas y opciones.");
    }
  };

  useEffect(() => {
    if (cuestionarioId) {
      obtenerPreguntasConOpciones();
    }
  }, [cuestionarioId]);

  const verOpcionesModal = (id) => {
    const pregunta = preguntasConOpciones.find((preg) => preg.id === id);
    setModalOpciones(pregunta ? pregunta.opciones : []);
    setModalOpcionVisible(id);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary me-3">📋 Gestionar Preguntas y Opciones</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate(`/admin/cuestionarios`)}>
          ← Volver al Cuestionario
        </button>
      </div>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <button className="btn btn-primary mb-4" onClick={agregarPregunta}>
        + Añadir Nueva Pregunta
      </button>

      {/* MODAL: Pregunta */}
      {modalVisible && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Añadir Pregunta</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                {preguntas.slice(-1).map((pregunta, index) => {
                  const realIndex = preguntas.length - 1;

                  return (
                    <div key={pregunta.id}>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Ingrese la pregunta"
                        value={pregunta.txt_pregunta}
                        onChange={(e) => {
                          const nuevasPreguntas = [...preguntas];
                          nuevasPreguntas[realIndex].txt_pregunta = e.target.value;
                          setPreguntas(nuevasPreguntas);
                        }}
                      />
                      <select
                        className="form-select mb-2"
                        value={pregunta.tipo_pregunta}
                        onChange={(e) => {
                          const nuevasPreguntas = [...preguntas];
                          nuevasPreguntas[realIndex].tipo_pregunta = e.target.value;
                          setPreguntas(nuevasPreguntas);
                        }}
                      >
                        <option value="">Seleccione un tipo de pregunta</option>
                        <option value="opcion_unica">Opción única</option>
                        <option value="opcion_multiple">Opción múltiple</option>
                        <option value="escala_likert">Escala Likert</option>
                        <option value="escala_numerica">Escala numérica</option>
                      </select>

                      <button className="btn btn-outline-success mb-2" onClick={() => guardarPregunta(realIndex)}>
                        Guardar Pregunta
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Opciones */}
      {modalOpcionVisible && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Opciones</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpcionVisible(null)}></button>
              </div>
              <div className="modal-body">
                {/* Mostrar las opciones existentes */}
                <ul>
                  {modalOpciones && modalOpciones.length > 0 ? (
                    modalOpciones.map((opcion, idx) => (
                      <li key={idx}>
                        {opcion.txt_opcion} - <strong>{opcion.puntaje}</strong>
                      </li>
                    ))
                  ) : (
                    <p>No hay opciones disponibles para esta pregunta.</p>
                  )}
                </ul>

                {/* Formulario para añadir una nueva opción */}
                <div className="mt-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Texto de la opción"
                    value={nuevaOpcion.txt_opcion}
                    onChange={(e) => setNuevaOpcion({ ...nuevaOpcion, txt_opcion: e.target.value })}
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Puntaje"
                    value={nuevaOpcion.puntaje}
                    onChange={(e) => setNuevaOpcion({ ...nuevaOpcion, puntaje: parseInt(e.target.value) || 0 })}
                  />
                  <button className="btn btn-success mt-2" onClick={guardarOpcion}>
                    Agregar Opción
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalOpcionVisible(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <hr />
      <h4 className="mt-5 mb-3">📑 Preguntas Registradas</h4>

      {preguntasConOpciones.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered shadow-sm">
            <thead className="table-dark">
              <tr>
                <th className="text-center">Pregunta</th>
                <th className="text-center">Tipo</th>
                <th className="text-center">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntasConOpciones.map((pregunta) => (
                <tr key={pregunta.id}>
                  <td className="text-start">{pregunta.txt_pregunta}</td>
                  <td className="text-center">
                    <span className="badge bg-secondary">{pregunta.tipo_pregunta}</span>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => verOpcionesModal(pregunta.id)}>
                      Ver Opciones
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No hay preguntas registradas aún.</p>
      )}
    </div>
  );
};

export default Formulario;
