const { query } = require('../config/conexion');

const crearPregunta = async ({ txt_pregunta, tipo, psicologo_id }) => {
  const sql = `INSERT INTO pregunta (txt_pregunta, tipo, psicologo_id) VALUES (?, ?, ?)`;
  const result = await query(sql, [txt_pregunta, tipo, psicologo_id]);
  return result.insertId;
};

const crearOpcion = async ({ txt_opcion, pregunta_id, psicologo_id }) => {
  const sql = `INSERT INTO opciones (txt_opcion, pregunta_id, psicologo_id) VALUES (?, ?, ?)`;
  const result = await query(sql, [txt_opcion, pregunta_id, psicologo_id]);
  return result.insertId;
};

const listarPreguntasConOpciones = async () => {
  const sql = `
    SELECT 
      p.id AS pregunta_id,
      p.txt_pregunta,
      p.tipo,
      o.id AS opcion_id,
      o.txt_opcion
    FROM 
      pregunta p
    LEFT JOIN 
      opciones o ON p.id = o.pregunta_id
    ORDER BY 
      p.id ASC, o.id ASC
  `;

  const result = await query(sql);
  return result;
};

module.exports = {
  crearPregunta,
  crearOpcion,
  listarPreguntasConOpciones,
};