const cron = require('node-cron');
const { obtenerEstudiantesInactivos } = require('../models/usuario');
const { enviarNotificacionSistema } = require('../services/notificacion.service');

cron.schedule('0 8 * * *', async () => {
  console.log('🔄 Verificando inactividad de estudiantes...');

  const inactivos = await obtenerEstudiantesInactivos(7);

  for (const estudiante of inactivos) {
    if (estudiante.usuario_id) {
      await enviarNotificacionSistema({
        usuario_id: estudiante.usuario_id,
        titulo: '¿Todo bien?',
        mensaje: 'Hace días que no ingresas a la app. Te esperamos con nuevas actividades para ti.',
        tipo: 'inactividad',
      });
      console.log(`Notificación de inactividad enviada a usuario ${estudiante.usuario_id}`);
    }
  }
});