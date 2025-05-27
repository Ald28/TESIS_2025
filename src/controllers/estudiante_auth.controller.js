const { enviarNotificacionSistema, enviarNotificacionWeb } = require('../services/notificacion.service');
const { verifyGoogleToken } = require('../services/googleAuth.service');
const estudianteModel = require('../models/estudiante.model');
const usuarioModel = require('../models/usuario');
const citaModel = require('../models/cita.model');
const jwt = require('jsonwebtoken');

const loginGoogleEstudiante = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Token de Google requerido' });

    const userData = await verifyGoogleToken(credential);
    const { nombre, apellido, correo, picture } = userData;

    const usuarios = await usuarioModel.buscarUsuarioPorCorreo(correo);

    if (usuarios.length > 0) {
      const usuario = usuarios[0];

      if (usuario.rol_id !== 2) {
        return res.status(403).json({ message: 'Este usuario no es un estudiante' });
      }

      let estudiante = await estudianteModel.buscarPorUsuarioId(usuario.id);

      if (!estudiante) {
        await estudianteModel.crearEstudiante({
          usuario_id: usuario.id,
          ciclo: '',
          fecha_nacimiento: null,
          carrera: ''
        });

        estudiante = await estudianteModel.buscarPorUsuarioId(usuario.id);
      }

      await usuarioModel.actualizarUltimaConexion(usuario.id);

      const token = jwt.sign({ id: usuario.id, rol: usuario.rol_id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT,
      });

      return res.status(200).json({
        message: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          estudiante_id: estudiante.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol_id: usuario.rol_id,
          multimedia_id: usuario.multimedia_id,
        }
      });
    }

    const multimedia_id = await usuarioModel.insertarMultimedia(picture);
    const usuario_id = await usuarioModel.crearUsuario({
      nombre,
      apellido,
      correo,
      rol_id: 2,
      multimedia_id,
    });

    await estudianteModel.crearEstudiante({
      usuario_id,
      ciclo: '',
      fecha_nacimiento: null,
      carrera: ''
    });

    const estudianteNuevo = await estudianteModel.buscarPorUsuarioId(usuario_id);

    const token = jwt.sign({ id: usuario_id, rol: 2 }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT,
    });

    return res.status(201).json({
      message: 'Estudiante creado y autenticado',
      token,
      usuario: {
        id: usuario_id,
        estudiante_id: estudianteNuevo.id,
        nombre,
        apellido,
        correo,
        rol_id: 2,
        multimedia_id,
      }
    });

  } catch (error) {
    console.error('Error en loginGoogleEstudiante:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const obtenerPerfilEstudiante = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.rol !== 2) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const datos = await estudianteModel.obtenerDatosEstudiantePorId(decoded.id);

    if (!datos) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json({ estudiante: datos });
  } catch (error) {
    console.error('Error al obtener datos del estudiante:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const crearCita = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const estudiante = await estudianteModel.obtenerDatosEstudiantePorId(decoded.id);
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    const { fecha, hora_inicio, hora_fin, psicologo_id } = req.body;
    const fechaInicio = new Date(`${fecha}T${hora_inicio}`);
    const fechaFin = new Date(`${fecha}T${hora_fin}`);

    const ahora = new Date();

    const esHoy = new Date().toISOString().split('T')[0] === fecha;
    if (esHoy && fechaInicio < ahora) {
      return res.status(400).json({ message: 'No puedes separar una cita en una hora que ya pasó.' });
    }

    const duracionMin = 30 * 60 * 1000;
    const duracionMax = 60 * 60 * 1000;
    const duracion = fechaFin - fechaInicio;

    if (duracion < duracionMin) {
      return res.status(400).json({ message: 'La cita debe durar al menos 30 minutos' });
    }
    if (duracion > duracionMax) {
      return res.status(400).json({ message: 'La cita no puede durar más de 1 hora' });
    }

    await citaModel.validarDisponibilidad(psicologo_id, fechaInicio, fechaFin, estudiante.estudiante_id);

    const id = await citaModel.crearCita({
      fecha,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estudiante_id: estudiante.estudiante_id,
      psicologo_id
    });

    // ENVIAR NOTIFICACIÓN AL PSICÓLOGO
    const usuarioPsicologo = await usuarioModel.obtenerUsuarioPorPsicologoId(psicologo_id);
    if (usuarioPsicologo?.id) {
      try {
        const nombreEstudiante = `${estudiante.nombre} ${estudiante.apellido}`;
        await enviarNotificacionWeb({
          usuario_id: usuarioPsicologo.id,
          titulo: 'Nueva cita pendiente',
          mensaje: `Tienes una nueva cita pendiente con ${nombreEstudiante}.`,
          tipo: 'sistema',
        });
      } catch (error) {
        console.error('Error al enviar notificación al psicólogo:', error.message || error);
      }
    }

    return res.status(201).json({ message: 'Cita registrada', id });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
};

const listarTodosEstudiantes = async (req, res) => {
  try {
    const estudiantes = await estudianteModel.listarEstudiantes();
    res.json({ estudiantes });
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const cancelarCita = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const estudiante = await estudianteModel.obtenerDatosEstudiantePorId(decoded.id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    const { cita_id } = req.body;
    if (!cita_id) return res.status(400).json({ message: 'ID de cita requerido' });

    const exito = await citaModel.cancelarCitaPorEstudiante(cita_id, estudiante.estudiante_id);

    if (exito) {
      return res.status(200).json({ message: 'Cita cancelada correctamente' });
    } else {
      return res.status(400).json({ message: 'No se pudo cancelar la cita. Puede que ya esté cancelada o no te pertenezca.' });
    }

  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const obtenerCitasActivas = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const estudiante = await estudianteModel.obtenerDatosEstudiantePorId(decoded.id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    const citas = await citaModel.obtenerCitasActivasPorEstudiante(estudiante.estudiante_id);
    return res.status(200).json({ citas });
  } catch (error) {
    console.error('Error al obtener citas activas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const editarPerfilEstudiante = async (req, res) => {
  try {
    const { ciclo, fecha_nacimiento, carrera, multimedia_id } = req.body;
    const usuario_id = req.usuario.id;

    if (!ciclo || !fecha_nacimiento || !carrera) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    await estudianteModel.actualizarEstudiante({
      usuario_id,
      ciclo,
      fecha_nacimiento,
      carrera
    });

    if (multimedia_id) {
      await usuarioModel.actualizarMultimediaUsuario(usuario_id, multimedia_id);
    }

    return res.status(200).json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
};

const actualizarConexion = async (req, res) => {
  try {
    const { id } = req.params;
    await usuarioModel.actualizarUltimaConexion(id);

    return res.status(200).json({ message: 'Ultima conexcion agregada correctamente' });
  } catch (error) {
    console.log('Error al actualziar ultima conexion', error);
    return res.status(500).json({ message: 'Error al actialziar conexcion' });

  }
};

module.exports = { loginGoogleEstudiante, obtenerPerfilEstudiante, crearCita, listarTodosEstudiantes, cancelarCita, obtenerCitasActivas, editarPerfilEstudiante, actualizarConexion };