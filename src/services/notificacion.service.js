const notificacionModel = require('../models/notificacion.model');
const admin = require('firebase-admin');

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

module.exports = { enviarNotificacionSistema };