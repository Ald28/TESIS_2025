import React from "react";
import { useParams } from "react-router-dom";

const Formulario = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Detalles del Cuestionario</h2>
      <p>ID del Cuestionario: {id}</p>
      {/* Aquí puedes cargar las preguntas y opciones relacionadas con este cuestionario */}
    </div>
  );
};

export default Formulario;
