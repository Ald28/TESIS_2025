const { crearNotificacion } = require('../models/notificacion.model');
const notificacionModel = require('../models/notificacion.model');
const timezone = require('dayjs/plugin/timezone');
const admin = require('firebase-admin');
const utc = require('dayjs/plugin/utc');
const dayjs = require('dayjs');
dayjs.extend(timezone);
dayjs.extend(utc);

const enviarNotificacionSistema = async ({ usuario_id, titulo, mensaje, tipo = 'sistema' }) => {
  const token = await notificacionModel.obtenerTokenPorUsuarioId(usuario_id);
  if (!token) return;

  const payload = {
    notification: { title: titulo, body: mensaje },
    token
  };

  await admin.messaging().send(payload);
  await notificacionModel.crearNotificacion({ titulo, mensaje, tipo, usuario_id });
};

const enviarNotificacionWeb = async ({ usuario_id, titulo, mensaje, tipo = 'sistema' }) => {
  await crearNotificacion({ titulo, mensaje, tipo, usuario_id });

  if (global.io) {
    global.io.to(`usuario_${usuario_id}`).emit('nuevaNotificacion', {
      titulo,
      mensaje,
      tipo,
      fecha_envio: dayjs().tz('America/Lima').toDate()
    });
    console.log(`📢 Notificación enviada a usuario ${usuario_id}`);
  } else {
    console.warn('⚠️ Socket.IO no está inicializado');
  }
};

module.exports = { enviarNotificacionSistema, enviarNotificacionWeb };