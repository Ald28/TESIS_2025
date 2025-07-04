const inactividadModel = require('../models/innactividad.model');
const { enviarNotificacionWeb } = require('../services/notificacion.service');

const revisarInactividad = async (req, res) => {
  try {
    const estudiantesInactivos = await inactividadModel.obtenerEstudiantesInactivos2Dias();

    for (const estudiante of estudiantesInactivos) {
      await enviarNotificacionWeb({
        usuario_id: estudiante.usuario_psicologo_id,
        titulo: 'Estudiante inactivo',
        mensaje: `El estudiante ${estudiante.nombre} ${estudiante.apellido} ha estado inactivo por más de 1 día.`,
        tipo: 'sistema'
      });

      await inactividadModel.registrarUltimaNotificacion(estudiante.usuario_id);
    }

    return res.status(200).json({
      message: `${estudiantesInactivos.length} notificaciones emitidas.`,
      estudiantes: estudiantesInactivos
    });
  } catch (error) {
    console.error('Error al revisar inactividad:', error);
    return res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
};

const notificarCitasProximas = async (req, res) => {
  try {
    const citas = await inactividadModel.obtenerCitasProximas();

    for (const cita of citas) {
      await enviarNotificacionWeb({
        usuario_id: cita.usuario_psicologo_id,
        titulo: 'Cita próxima',
        mensaje: `Tienes una cita con ${cita.estudiante_nombre} ${cita.estudiante_apellido} en menos de 5 minutos.`,
        tipo: 'sistema'
      });
    }

    res.status(200).json({
      message: `${citas.length} notificaciones enviadas por citas próximas.`,
      citas
    });
  } catch (error) {
    console.error('❌ Error al notificar citas próximas:', error);
    res.status(500).json({ message: 'Error al procesar notificaciones.' });
  }
};

module.exports = { revisarInactividad, notificarCitasProximas };