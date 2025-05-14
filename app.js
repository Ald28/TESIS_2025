const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Llamada a routes
const psicologoAuthRoutes = require('./src/routes/psicologo_auth.routes');
const estudianteAuthRoutes = require('./src/routes/estudiante_auth.routes');
const crearPreguntaRoutes = require('./src/routes/pregunta.routes');
const crearMetodo = require('./src/routes/metodo_relajacion.routes');
const adminAuthRoutes = require('./src/routes/admin_auth.routes');
const observacionRoutes = require('./src/routes/observacion.routes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json());

// Rutas
app.use('/auth/psicologo', psicologoAuthRoutes);
app.use('/auth', estudianteAuthRoutes);
app.use('/auth/admin', adminAuthRoutes);
app.use('/api', observacionRoutes);
app.use('/api', crearPreguntaRoutes);
app.use('/api', crearMetodo);

module.exports = app;