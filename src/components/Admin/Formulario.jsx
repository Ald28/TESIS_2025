import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Formulario = () => {
  const { id } = useParams();
  const [preguntas, setPreguntas] = useState([]);

  const agregarPregunta = () => {
    setPreguntas([
      ...preguntas,
      { id: preguntas.length + 1, txt_pregunta: "", tipo_pregunta: "", opciones: [] },
    ]);
  };

  const agregarOpcion = (index) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index].opciones.push({ txt_opcion: "", puntaje: 0 });
    setPreguntas(nuevasPreguntas);
  };

  const eliminarOpcion = (preguntaIndex, opcionIndex) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[preguntaIndex].opciones = nuevasPreguntas[preguntaIndex].opciones.filter((_, i) => i !== opcionIndex);
    setPreguntas(nuevasPreguntas);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Agregar preguntas y opciones al Cuestionario</h1>
        <p>ID del Cuestionario: {id}</p>
        <div>
          <button className="btn btn-outline-success me-2">Volver al Cuestionario</button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a className="nav-link active" href="#">Preguntas y Opciones</a>
        </li>
      </ul>

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
            <option value="opcion_unica">Opción múltiple (una respuesta)</option>
            <option value="opcion_multiple">Opción múltiple (varias respuestas)</option>
            <option value="escala_likert">Escala Likert</option>
            <option value="escala_numerica">Escala numérica</option>
          </select>
          <div className="form-check mb-2">
            <input type="checkbox" className="form-check-input" />
            <label className="form-check-label">Pregunta obligatoria</label>
          </div>

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
                <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarOpcion(index, opcionIndex)}>X</button>
              </div>
            ))}
            <button className="btn btn-sm btn-outline-primary" onClick={() => agregarOpcion(index)}>+ Añadir Opción</button>
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