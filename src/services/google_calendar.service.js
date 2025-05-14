const { google } = require('googleapis');
const { query } = require('../config/conexion');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID_WEB,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:8080/auth/google/calendar-callback'
);

const guardarTokensPsicologo = async (correo, tokens) => {
  // Buscar al usuario por correo
  const rows = await query('SELECT id FROM usuario WHERE correo = ?', [correo]);
  const usuario_id = rows[0]?.id;

  if (!usuario_id) throw new Error('Psicólogo no encontrado');

  // Buscar al psicólogo por usuario_id
  const psicologos = await query('SELECT id FROM psicologo WHERE usuario_id = ?', [usuario_id]);
  const psicologo_id = psicologos[0]?.id;

  if (!psicologo_id) throw new Error('Psicólogo no registrado en tabla psicologo');

  // Guardar o actualizar los tokens en la tabla google_tokens
  await query(`
    INSERT INTO google_tokens (psicologo_id, access_token, refresh_token)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE access_token = ?, refresh_token = ?
  `, [psicologo_id, tokens.access_token, tokens.refresh_token, tokens.access_token, tokens.refresh_token]);
};

// Función para crear el evento
const crearEventoPsicologo = async (correo, eventoData) => {
  // Paso 1: Buscar tokens
  const rows = await query('SELECT id FROM usuario WHERE correo = ?', [correo]);
  const usuario_id = rows[0]?.id;
  console.log('Usuario ID:', usuario_id);
  if (!usuario_id) throw new Error('Usuario no encontrado');

  const psicologos = await query('SELECT id FROM psicologo WHERE usuario_id = ?', [usuario_id]);
  const psicologo_id = psicologos[0]?.id;
  if (!psicologo_id) throw new Error('Psicólogo no encontrado');

  const tokens = await query('SELECT access_token, refresh_token FROM google_tokens WHERE psicologo_id = ?', [psicologo_id]);
  const { access_token, refresh_token } = tokens[0] || {};
  if (!access_token || !refresh_token) throw new Error('Tokens de Google no encontrados');

  // Paso 2: Asignar tokens
  oAuth2Client.setCredentials({ access_token, refresh_token });

  // Paso 3: Crear evento con Google Calendar API
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const evento = {
    summary: eventoData.summary,
    description: eventoData.description,
    start: {
      dateTime: eventoData.start, // formato: '2025-04-23T10:00:00-05:00'
      timeZone: 'America/Lima',
    },
    end: {
      dateTime: eventoData.end,
      timeZone: 'America/Lima',
    },
    attendees: eventoData.attendees, // [{ email: 'paciente@gmail.com' }]
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: evento,
  });
  console.log('Evento creado:', response.data);

  return response.data;
};

const obtenerTokensPorCorreo = async (correo) => {
  const rows = await query(`
    SELECT gt.access_token, gt.refresh_token 
    FROM google_tokens gt
    JOIN psicologo p ON gt.psicologo_id = p.id
    JOIN usuario u ON p.usuario_id = u.id
    WHERE u.correo = ?
  `, [correo]);

  if (rows.length === 0) {
    return null;
  }

  return {
    access_token: rows[0].access_token,
    refresh_token: rows[0].refresh_token
  };
};

const verificarEventosGoogleCalendar = async (correo, fechaInicio, fechaFin) => {
  const tokens = await obtenerTokensPorCorreo(correo);
  if (!tokens) return false;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID_WEB,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:8080/auth/google/calendar-callback'
  );
  auth.setCredentials(tokens);
  

  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: fechaInicio.toISOString(),
      timeMax: fechaFin.toISOString(),
      timeZone: 'America/Lima',
      items: [{ id: correo }],
    },
  });

  const busyTimes = response.data.calendars[correo].busy;
  return busyTimes.length > 0;
};

const eliminarEventoGoogleCalendar = async (correo, eventoId) => {
  const tokens = await obtenerTokensPorCorreo(correo);
  if (!tokens || !tokens.access_token) {
    console.warn(`⚠️ No se encontraron tokens para el usuario ${correo}`);
    return;
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID_WEB,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:8080/auth/google/calendar-callback'
  );

  auth.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventoId,
    });
    console.log(`✅ Evento ${eventoId} eliminado del calendario de ${correo}`);
  } catch (error) {
    console.error('❌ Error al eliminar evento de Google Calendar:', error.message || error);
  }
};

module.exports = {
  guardarTokensPsicologo,
  crearEventoPsicologo,
  verificarEventosGoogleCalendar,
  eliminarEventoGoogleCalendar,
};