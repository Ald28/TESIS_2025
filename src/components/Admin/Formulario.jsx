import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearPregunta } from "../Api/api_pregunta";
import { crearOpcion } from "../Api/api_opcion";

const Formulario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const agregarPregunta = () => {
    setPreguntas([
      ...preguntas,
      { id: preguntas.length + 1, txt_pregunta: "", tipo_pregunta: "", opciones: [], pregunta_id: null },
    ]);
  };

  const agregarOpcion = (index) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index].opciones.push({ txt_opcion: "", puntaje: 0 });
    setPreguntas(nuevasPreguntas);
  };

  const eliminarOpcion = (preguntaIndex, opcionIndex) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[preguntaIndex].opciones.splice(opcionIndex, 1);
    setPreguntas(nuevasPreguntas);
  };

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const psicologo_id = usuario?.psicologo_id;

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
        cuestionario_id: id,
        psicologo_id: psicologo_id,
      });
  
      console.log("Respuesta completa de la API:", response);
      
      if (response.pregunta && response.pregunta.id) {
        const nuevasPreguntas = [...preguntas];
        nuevasPreguntas[index].pregunta_id = response.pregunta.id; 
        setPreguntas(nuevasPreguntas);
        setMensaje("Pregunta guardada correctamente.");
      } else {
        setMensaje("Error: No se recibió un ID de la pregunta.");
      }
  
    } catch (error) {
      console.error("Error al guardar la pregunta:", error);
      setMensaje("Error al guardar la pregunta.");
    }
  };

  const guardarOpcion = async (preguntaIndex, opcionIndex) => {
    setMensaje("");
    const pregunta = preguntas[preguntaIndex];
    const opcion = pregunta.opciones[opcionIndex];
    console.log("Intentando guardar opción en pregunta ID:", pregunta.pregunta_id);
    if (!pregunta.pregunta_id) {
      setMensaje("Debe guardar la pregunta antes de añadir opciones.");
      return;
    }

    if (!opcion.txt_opcion || opcion.puntaje === null) {
      setMensaje("Cada opción debe tener texto y puntaje.");
      return;
    }

    try {
      await crearOpcion({
        txt_opcion: opcion.txt_opcion,
        puntaje: opcion.puntaje,
        pregunta_id: pregunta.pregunta_id,
        psicologo_id: psicologo_id,
      });

      setMensaje("Opción guardada correctamente.");
    } catch {
      setMensaje("Error al guardar la opción.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Agregar preguntas y opciones al Cuestionario</h1>
        <div>
          <button className="btn btn-outline-success me-2" onClick={() => navigate(`/admin/cuestionarios`)}>Volver al Cuestionario</button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a className="nav-link active" href="#">Preguntas y Opciones</a>
        </li>
      </ul>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      {preguntas.map((pregunta, index) => (
        <div key={pregunta.id} className="question-card p-3 mb-4 border rounded bg-light">
          <h5>Pregunta {index + 1}</h5>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Ingrese la pregunta"
            value={pregunta.txt_pregunta}
            onChange={(e) => {
              const nuevasPreguntas = [...preguntas];
              nuevasPreguntas[index].txt_pregunta = e.target.value;
              setPreguntas(nuevasPreguntas);
            }}
          />
          <select
            className="form-select mb-2"
            value={pregunta.tipo_pregunta}
            onChange={(e) => {
              const nuevasPreguntas = [...preguntas];
              nuevasPreguntas[index].tipo_pregunta = e.target.value;
              setPreguntas(nuevasPreguntas);
            }}
          >
            <option value="">Seleccione un tipo de pregunta</option>
            <option value="opcion_unica">Opción única</option>
            <option value="opcion_multiple">Opción múltiple</option>
            <option value="escala_likert">Escala Likert</option>
            <option value="escala_numerica">Escala numérica</option>
          </select>

          <button className="btn btn-outline-success mb-2" onClick={() => guardarPregunta(index)}>
            Guardar Pregunta
          </button>

          <div className="opciones">
            <h6>Opciones</h6>
            {pregunta.opciones.map((opcion, opcionIndex) => (
              <div key={opcionIndex} className="d-flex mb-2 align-items-center">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Ingrese la opción"
                  value={opcion.txt_opcion}
                  onChange={(e) => {
                    const nuevasPreguntas = [...preguntas];
                    nuevasPreguntas[index].opciones[opcionIndex].txt_opcion = e.target.value;
                    setPreguntas(nuevasPreguntas);
                  }}
                />
                <input
                  type="number"
                  className="form-control me-2"
                  placeholder="Puntaje"
                  value={opcion.puntaje}
                  onChange={(e) => {
                    const nuevasPreguntas = [...preguntas];
                    nuevasPreguntas[index].opciones[opcionIndex].puntaje = Number(e.target.value);
                    setPreguntas(nuevasPreguntas);
                  }}
                />
                <button className="btn btn-sm btn-outline-danger me-2" onClick={() => eliminarOpcion(index, opcionIndex)}>X</button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => guardarOpcion(index, opcionIndex)}>Guardar Opción</button>
              </div>
            ))}
            <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => agregarOpcion(index)}>+ Añadir Opción</button>
          </div>

          <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => {
            setPreguntas(preguntas.filter((_, i) => i !== index));
          }}>Eliminar Pregunta</button>
        </div>
      ))}

      <button className="btn btn-primary" onClick={agregarPregunta}>+ Añadir Nueva Pregunta</button>
    </div>
  );
};

export default Formulario;
