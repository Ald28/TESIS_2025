const { query } = require('../config/conexion');

const crearMultimedia = async ({ url }) => {
    const sql = 'INSERT INTO multimedia_actividad (url) VALUES (?)';
    return await query(sql, [url]);
}

module.exports = {crearMultimedia};