require('dotenv').config();
require('./src/config/conexion.js');

const app = require('./app.js');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});