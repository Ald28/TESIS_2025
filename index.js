require('./src/jobs/inactividad.job');
require('./src/config/conexion.js');
require('dotenv').config();

const app = require('./app.js');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});