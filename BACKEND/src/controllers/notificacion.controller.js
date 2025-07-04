const admin = require('firebase-admin');
const notificacionModel = require('../models/notificacion.model');

// Inicializar Firebase solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG_JSON)),
  });
}

const guardarTokenFCM = async (req, res) => {
  try {
    console.log('📥 Datos recibidos:', req.body);
    const { usuario_id, token, plataforma } = req.body;

    await notificacionModel.guardarTokenFCM({ usuario_id, token, plataforma });

    return res.status(201).json({ message: 'Token FCM guardado correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar token FCM:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const enviarNotificacion = async (req, res) => {
  try {
    const { usuario_id, titulo, mensaje, tipo = 'sistema' } = req.body;

    const token = await notificacionModel.obtenerTokenPorUsuarioId(usuario_id);
    if (!token) {
      return res.status(404).json({ message: 'Token FCM no encontrado para este usuario' });
    }

    const payload = {
      notification: {
        title: titulo,
        body: mensaje,
      },
      token,
    };

    await admin.messaging().send(payload);

    await notificacionModel.crearNotificacion({ titulo, mensaje, tipo, usuario_id });

    return res.status(200).json({ message: 'Notificación enviada y registrada' });
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
    return res.status(500).json({ message: 'Error interno al enviar notificación' });
  }
};

const listarNotificaciones = async (req, res) => {
  try {
    const usuario_id = req.params.usuario_id;

    if (!usuario_id) {
      return res.status(400).json({ message: 'Falta el ID del usuario' });
    }

    const notificaciones = await notificacionModel.listarNotificacionesPorUsuarioId(usuario_id);
    res.status(200).json({ notificaciones });
  } catch (error) {
    console.error('❌ Error al listar notificaciones:', error);
    res.status(500).json({ message: 'Error al listar notificaciones' });
  }
};

const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Falta el ID de la notificación' });
    }

    await notificacionModel.eliminarNotificaciones(id);
    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar notificación:', error);
    res.status(500).json({ message: 'Error al eliminar notificación' });
  }
};

const verificarTokenFCM = async (req, res) => {
  try {
    const { token } = req.params;
    const existe = await notificacionModel.verificarExistenciaTokenFCM(token);
    return res.json({ existe });
  } catch (error) {
    console.error("❌ Error al verificar token FCM:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  guardarTokenFCM,
  enviarNotificacion,
  listarNotificaciones,
  eliminarNotificacion,
  verificarTokenFCM,
};