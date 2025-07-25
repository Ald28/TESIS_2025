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
const chatRoutes = require('./src/routes/chat.routes');
const perfil = require("./src/routes/multimedia.routes") // CAMBIAR PERFIL ESTUDIANTE
const notificacionRoutes = require('./src/routes/notificacion.routes');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = [
  "https://app.calmatec.es",
  "https://admin.calmatec.es"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Rutas
app.use("/api/multimedia", perfil); // CAMBIAR PERFIL ESTUDIANTE
app.use('/auth/psicologo', psicologoAuthRoutes);
app.use('/auth', estudianteAuthRoutes);
app.use('/auth/admin', adminAuthRoutes);
app.use('/api', observacionRoutes);
app.use('/api', crearPreguntaRoutes);
app.use('/api', crearMetodo);
app.use('/api', chatRoutes);
app.use('/api/notificaciones', notificacionRoutes);

module.exports = app;