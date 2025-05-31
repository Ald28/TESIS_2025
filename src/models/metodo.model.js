const { query } = require('../config/conexion');

const crearMetodo = async ({ titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id, estudiante_id }) => {
  let sql, params;

  if (tipo === 'privado') {
    sql = `
      INSERT INTO metodos (titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id, estudiante_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    params = [titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id, estudiante_id];
  } else {
    sql = `
      INSERT INTO metodos (titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    params = [titulo, descripcion, tipo, psicologo_id, multimedia_actividad_id];
  }

  return await query(sql, params);
};

const listarMetodosPrivadosPorEstudiante = async (estudiante_id) => {
  const sql = `
    SELECT 
      m.id,
      m.titulo,
      m.descripcion,
      m.tipo,
      ma.url AS multimedia_url,
      u.nombre AS nombre_psicologo,
      u.apellido AS apellido_psicologo
    FROM metodos m
    INNER JOIN multimedia_actividad ma ON m.multimedia_actividad_id = ma.id
    INNER JOIN psicologo p ON m.psicologo_id = p.id
    INNER JOIN usuario u ON p.usuario_id = u.id
    WHERE m.tipo = 'privado' AND m.estudiante_id = ?
  `;
  const resultado = await query(sql, [estudiante_id]);
  return resultado;
};

const listarMetodosRecomendados = async () => {
  const sql = `
    SELECT 
      m.id,
      m.titulo,
      m.descripcion,
      m.tipo,
      ma.url AS multimedia_url,
      u.nombre AS nombre_psicologo,
      u.apellido AS apellido_psicologo
    FROM metodos m
    INNER JOIN multimedia_actividad ma ON m.multimedia_actividad_id = ma.id
    INNER JOIN psicologo p ON m.psicologo_id = p.id
    INNER JOIN usuario u ON p.usuario_id = u.id
    WHERE m.tipo = 'recomendado'
  `;
  const resultado = await query(sql);
  return resultado;
};

const listarTodosMetodosPrivados = async () => {
  const sql = `
    SELECT 
      m.id, 
      m.titulo, 
      m.descripcion, 
      ma.url AS multimedia_url,
      e.id AS estudiante_id,
      u.nombre,
      u.apellido
    FROM metodos m
    INNER JOIN multimedia_actividad ma ON m.multimedia_actividad_id = ma.id
    INNER JOIN estudiante e ON m.estudiante_id = e.id
    INNER JOIN usuario u ON e.usuario_id = u.id
    WHERE m.tipo = 'privado'
  `;

  const resultados = await query(sql);
  return resultados;
};

module.exports = {
  crearMetodo,
  listarMetodosPrivadosPorEstudiante,
  listarMetodosRecomendados,
  listarTodosMetodosPrivados,
};