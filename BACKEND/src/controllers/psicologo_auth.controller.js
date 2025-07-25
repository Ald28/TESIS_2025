const { guardarTokensPsicologo, crearEventoPsicologo, eliminarEventoGoogleCalendar } = require('../services/google_calendar.service');
const { enviarNotificacionSistema } = require('../services/notificacion.service');
const { enviarCorreoCitaAceptada } = require('../services/email.service');
const { verifyGoogleToken } = require('../services/googleAuth.service');
const psicologoModel = require('../models/psicologo.model');
const estudianteModel = require('../models/estudiante.model');
const usuarioModel = require('../models/usuario');
const citaModel = require('../models/cita.model');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const dayjs = require('dayjs');
dayjs.extend(timezone);
dayjs.extend(utc);

const loginGooglePsicologo = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ message: 'Token de Google requerido' });

        const userData = await verifyGoogleToken(credential);
        const { nombre, apellido, correo, picture } = userData;

        const usuarios = await usuarioModel.buscarUsuarioPorCorreo(correo);

        if (usuarios.length === 0) {
            return res.status(403).json({
                message: 'Este correo no está registrado como psicólogo. Contacta al administrador para ser habilitado.',
            });
        }

        const usuario = usuarios[0];

        if (usuario.rol_id !== 1) {
            return res.status(403).json({
                message: 'Este usuario no tiene permisos como psicólogo.',
            });
        }

        if (usuario.estado !== "activo") {
            return res.status(403).json({
                message: 'Tu cuenta está inactiva. Contacta al administrador para habilitar el acceso.',
            });
        }

        if (!usuario.multimedia_id) {
            const multimedia_id = await usuarioModel.insertarMultimedia(picture);
            await usuarioModel.actualizarMultimediaUsuario(usuario.id, multimedia_id);
            usuario.multimedia_id = multimedia_id;
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TIMEOUT }
        );

        return res.status(200).json({
            message: 'Login exitoso',
            token,
            usuario,
        });

    } catch (error) {
        console.error('Error en loginGooglePsicologo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/* AUTH GOOGLE CALENDAR */

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID_WEB,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://api.calmatec.es/auth/psicologo/google/calendar-callback'
);
const iniciarOAuthGoogleCalendar = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
        prompt: 'consent',
    });

    res.redirect(url);
};

const googleCalendarCallback = async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) return res.status(400).send('❌ Código de autorización no proporcionado');

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        if (!tokens.access_token) {
            console.error('No se recibió el access_token', tokens);
            return res.status(401).send('❌ No se recibió el token de acceso');
        }

        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const correo = userInfoResponse.data.email;

        if (!correo) {
            console.error('No se pudo obtener el correo del usuario:', userInfoResponse.data);
            return res.status(400).send('❌ No se pudo obtener el correo del usuario');
        }

        await guardarTokensPsicologo(correo, tokens);

        res.send(`
            <script>
              window.opener.postMessage({ status: 'calendar-connected' }, '*');
              window.close();
            </script>
          `);

    } catch (error) {
        console.error('Error en googleCalendarCallback:', error?.response?.data || error.message || error);
        res.status(500).send('❌ Error al conectar con Google Calendar');
    }
};

const obtenerDisponibilidadPorId = async (req, res) => {
    try {
        const psicologo_id = req.params.id;
        const disponibilidad = await psicologoModel.obtenerDisponibilidadPorPsicologo(psicologo_id);
        res.status(200).json({ disponibilidad });
    } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        res.status(500).json({ message: 'Error interno al obtener disponibilidad' });
    }
};

const listarPsicologos = async (req, res) => {
    try {
        const psicologos = await psicologoModel.listarPsicologos();
        res.status(200).json(psicologos);
    } catch (error) {
        console.error('Error al listar psicólogos:', error);
        res.status(500).json({ message: 'Error al obtener psicólogos' });
    }
};

const obtenerCitasDelPsicologo = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token requerido' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const psicologo = await psicologoModel.obtenerPsicologoPorUsuarioId(decoded.id);

        if (!psicologo) return res.status(404).json({ message: 'Psicólogo no encontrado' });

        const citas = await citaModel.obtenerCitasPorPsicologo(psicologo.id);
        res.status(200).json({ citas });
    } catch (error) {
        console.error('Error al obtener citas del psicólogo:', error);
        res.status(500).json({ message: 'Error al obtener citas del psicólogo' });
    }
};

const cambiarEstadoCita = async (req, res) => {
    try {
        const { cita_id, estado } = req.body;

        if (!cita_id || !estado) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }

        let evento_google_id = null;

        if (estado === 'aceptada') {
            const cita = await psicologoModel.obtenerDetallesCita(cita_id);
            const estudiante = await psicologoModel.obtenerNombreCompletoEstudiante(cita.estudiante_id);
            const psicologo = await psicologoModel.obtenerNombreCompletoPsicologo(cita.usuario_psicologo);
            const correoPsicologo = psicologo?.correo;

            const evento = {
                summary: `Cita psicológica: ${estudiante?.nombre_completo} con ${psicologo?.nombre_completo}`,
                description: 'Consulta programada por el sistema.',
                start: new Date(cita.fecha_inicio).toISOString(),
                end: new Date(cita.fecha_fin).toISOString(),
                attendees: [{ email: cita.correo_usuario }]
            };

            const eventoCreado = await crearEventoPsicologo(correoPsicologo, evento);

            /*console.error('a punto de enviar correo');
            try {
                console.error('a punto de enviar correo');
                await enviarCorreoCitaAceptada({
                    para: cita.correo_usuario,
                    nombreEstudiante: estudiante?.nombre_completo || '',
                    fecha: new Date(cita.fecha_inicio).toLocaleDateString('es-PE'),
                    horaInicio: new Date(cita.fecha_inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                    horaFin: new Date(cita.fecha_fin).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                });
            } catch (err) {
                console.error('❌ Error al enviar correo:', err.message || err);
                return res.status(500).json({ message: 'Error al enviar correo' });
            }*/

            const estudianteInfo = await estudianteModel.obtenerUsuarioPorEstudianteId(cita.estudiante_id);
            console.log('estudianteInfo:', estudianteInfo);
            
            if (!estudianteInfo || !estudianteInfo.usuario_id) {
                console.error('Error al obtener información del estudiante:', estudianteInfo);
                return res.status(404).json({ message: 'Estudiante no encontrado' });
            } else {
                try {
                    console.log('Enviando notificación push al estudiante:', estudianteInfo.usuario_id);
                    await enviarNotificacionSistema({
                        usuario_id: estudianteInfo.usuario_id,
                        titulo: 'Cita Aceptada',
                        mensaje: 'Tu cita con ${nombrePsicologo} ha sido aceptada.',
                        tipo: 'sistema'
                    });
                } catch (error) {
                    console.error('Error al enviar notificación push:', error.message || error);
                }
                console.log('Notificación enviada al estudiante:', estudianteInfo.usuario_id);
            }

            console.error('a punto de cambiar');
            try {
                console.error('cambiar estado');
                await citaModel.actualizarEstadoCita({
                    cita_id,
                    estado,
                    evento_google_id: eventoCreado?.id || null
                });
            } catch (error) {
                console.error('❌ Fallo al guardar la cita en la BD:', error);
                return res.status(500).json({ message: 'Error al actualizar la base de datos' });
            }

            return res.status(200).json({ message: 'Cita aceptada', eventoId: eventoCreado.id });
        }

        if (estado === 'realizada') {
            const cita = await psicologoModel.obtenerDetallesCita(cita_id);

            if (!cita || !cita.evento_google_id) {
                return res.status(404).json({ message: 'Cita no encontrada o sin evento asociado' });
            }

            const usuario = await usuarioModel.buscarUsuarioPorId(cita.usuario_psicologo);

            if (!usuario?.correo) {
                return res.status(400).json({ message: 'Correo del psicólogo no encontrado' });
            }

            const correoPsicologo = usuario.correo;

            await eliminarEventoGoogleCalendar(correoPsicologo, cita.evento_google_id);

            await citaModel.actualizarEstadoCita({
                cita_id,
                estado,
                evento_google_id: cita.evento_google_id,
            });

            return res.status(200).json({
                message: 'Cita marcada como realizada y evento eliminado, token conservado.',
            });
        }

        if (estado === 'rechazada') {
            const cita = await psicologoModel.obtenerDetallesCita(cita_id);

            if (!cita) {
                return res.status(404).json({ message: 'Cita no encontrada' });
            }

            const usuario = await usuarioModel.buscarUsuarioPorId(cita.usuario_psicologo);
            const nombrePsicologo = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Psicólogo';

            await citaModel.actualizarEstadoCita({
                cita_id,
                estado,
                evento_google_id: null,
            });

            const estudianteInfo = await estudianteModel.obtenerUsuarioPorEstudianteId(cita.estudiante_id);
            if (estudianteInfo?.usuario_id) {
                try {
                    await enviarNotificacionSistema({
                        usuario_id: estudianteInfo.usuario_id,
                        titulo: 'Cita Rechazada',
                        mensaje: `Tu cita con ${nombrePsicologo} ha sido rechazada.`,
                        tipo: 'alerta',
                    });
                } catch (err) {
                    console.error('❌ Error al enviar notificación push:', err.message || err);
                }
            }

            return res.status(200).json({
                message: 'Cita rechazada correctamente',
            });
        }

        await citaModel.actualizarEstadoCita({ cita_id, estado, evento_google_id });

        res.status(200).json({
            message: 'Estado actualizado correctamente',
            evento_google_id: evento_google_id || null
        });

    } catch (error) {
        console.error('Error al cambiar estado de cita:', error.message);
        res.status(500).json({ message: 'Error al cambiar estado de cita' });
    }
};

const obtenerPsicologoPorUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await psicologoModel.obtenerPsicologoPorUsuarioId(id);

        if (!result) {
            return res.status(404).json({ message: 'Psicólogo no encontrado' });
        }

        res.json({ psicologo_id: result.id });
    } catch (error) {
        console.error('Error al obtener psicólogo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const obtenerCitasAceptadas = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token requerido' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const psicologo = await psicologoModel.obtenerPsicologoPorUsuarioId(decoded.id);

        if (!psicologo) return res.status(404).json({ message: 'Psicólogo no encontrado' });

        const citas = await citaModel.obtenerCitasAceptadasPorPsicologo(psicologo.id);
        res.status(200).json({ citas });
    } catch (error) {
        console.error('❌ Error al obtener citas aceptadas:', error);
        res.status(500).json({ message: 'Error al obtener citas aceptadas' });
    }
};

const cancelarCitaPsicologo = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token requerido' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const psicologo = await psicologoModel.obtenerPsicologoPorUsuarioId(decoded.id);

        if (!psicologo) return res.status(404).json({ message: 'Psicólogo no encontrado' });

        const { cita_id } = req.body;
        if (!cita_id) return res.status(400).json({ message: 'ID de cita requerido' });

        const resultado = await citaModel.cancelarCitaPorPsicologo(cita_id, psicologo.id);
        if (!resultado.exito) {
            return res.status(400).json({ message: resultado.mensaje });
        }

        const cita = await citaModel.obtenerCitaPorId(cita_id);
        if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

        const usuarioId = psicologo.usuario_id || decoded.id;
        const infoPsicologo = await psicologoModel.obtenerNombreCompletoPsicologo(usuarioId);
        const nombrePsicologo = infoPsicologo?.nombre_completo || `${psicologo.nombre} ${psicologo.apellido}`;

        const estudianteInfo = await estudianteModel.obtenerUsuarioPorEstudianteId(cita.estudiante_id);
        if (!estudianteInfo || !estudianteInfo.usuario_id) {
            console.error('⚠️ Estudiante sin usuario válido:', estudianteInfo);
        } else {
            try {
                await enviarNotificacionSistema({
                    usuario_id: estudianteInfo.usuario_id,
                    titulo: 'Cita Cancelada',
                    mensaje: `Tu cita con ${nombrePsicologo} ha sido cancelada.`,
                    tipo: 'alerta',
                });
                console.log('Notificación enviada al estudiante:', estudianteInfo.usuario_id);
            } catch (error) {
                console.error('Error al enviar notificación push:', error.message || error);
            }
        }

        return res.status(200).json({ message: 'Cita cancelada correctamente' });

    } catch (error) {
        console.error('Error al cancelar cita:', error);
        return res.status(500).json({ message: 'Error al cancelar cita' });
    }
};

const obtenerHorasOcupadas = async (req, res) => {
    try {
        const { psicologo_id, fecha } = req.params;
        if (!psicologo_id || !fecha) {
            return res.status(400).json({ message: 'psicologo_id y fecha requeridos' });
        }

        const horas = await citaModel.obtenerHorasOcupadasPorPsicologo(psicologo_id, fecha);
        return res.status(200).json({ horas });
    } catch (error) {
        console.error('❌ Error al obtener horas ocupadas:', error);
        return res.status(500).json({ message: 'Error al obtener horas ocupadas' });
    }
};

const crearCitaSeguimiento = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { estudiante_id, fecha, hora_inicio, hora_fin } = req.body;
        console.log('Datos recibidos:', req.body);

        const psicologo = await psicologoModel.obtenerPsicologoConUsuario(decoded.id);
        if (!psicologo) return res.status(404).json({ message: 'Psicólogo no encontrado' });

        const correoPsicologo = psicologo.correo;

        const fecha_inicio = dayjs.tz(`${fecha} ${hora_inicio}`, 'YYYY-MM-DD HH:mm', 'America/Lima').toDate();
        const fecha_fin = dayjs.tz(`${fecha} ${hora_fin}`, 'YYYY-MM-DD HH:mm', 'America/Lima').toDate();

        await citaModel.validarDisponibilidadParaSeguimiento(psicologo.psicologo_id, fecha_inicio, fecha_fin, estudiante_id);

        const seguimiento_id = await citaModel.crearSeguimiento({
            estudiante_id,
            psicologo_id: psicologo.psicologo_id,
            fecha_inicio,
            fecha_fin,
            estado: 'activo'
        });

        const cita_id = await citaModel.crearCitaActivada({
            fecha,
            fecha_inicio,
            fecha_fin,
            estudiante_id,
            psicologo_id: psicologo.psicologo_id,
            seguimiento_id,
            estado: 'aceptada',
            creado_por: 'psicologo'
        });

        const eventoGoogle = await crearEventoPsicologo(correoPsicologo, {
            summary: 'Cita psicológica con estudiante',
            description: 'Cita de seguimiento agendada automáticamente',
            start: fecha_inicio.toISOString(),
            end: fecha_fin.toISOString(),
            attendees: []
        });

        await citaModel.actualizarEstadoCita({
            cita_id,
            estado: 'aceptada',
            evento_google_id: eventoGoogle.id
        });

        const usuarioId = psicologo.usuario_id || decoded.id;
        const infoPsicologo = await psicologoModel.obtenerNombreCompletoPsicologo(usuarioId);
        const nombrePsicologo = infoPsicologo?.nombre_completo || `${psicologo.nombre} ${psicologo.apellido}`;

        const estudianteInfo = await estudianteModel.obtenerUsuarioPorEstudianteId(estudiante_id);
        if (!estudianteInfo || !estudianteInfo.usuario_id) {
            console.error('⚠️ Estudiante sin usuario válido:', estudianteInfo);
        } else {
            try {
                await enviarNotificacionSistema({
                    usuario_id: estudianteInfo.usuario_id,
                    titulo: 'Nueva Cita Asignada',
                    mensaje: `Has sido asignado a una cita de seguimiento con ${nombrePsicologo}.`,
                    tipo: 'recordatorio',
                });
                console.log('Notificación de seguimiento enviada al estudiante:', estudianteInfo.usuario_id);
            } catch (error) {
                console.error('Error al enviar notificación push:', error.message || error);
            }
        }

        return res.status(201).json({ message: 'Cita de seguimiento creada y sincronizada con Google Calendar', cita_id });

    } catch (error) {
        console.error('❌ Error al crear cita de seguimiento:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor' });
    }
};

const estudiantePorPsicologo = async (req, res) => {
    const { psicologo_id } = req.params;

    try {
        const estudiantes = await estudianteModel.listarPorPsicologo(psicologo_id);
        res.json({ estudiantes });
    } catch (error) {
        console.error("Error al listar estudiantes:", error.message);
        res.status(500).json({ error: "Error al listar estudiantes relacionados al psicólogo." });
    }
};

const obtenerPerfilPsicologo = async (req, res) => {
    try {
        const usuario_id = req.params.usuario_id;
        const perfil = await psicologoModel.obtenerPerfilPsicologo(usuario_id);

        if (!perfil) {
            return res.status(404).json({ message: 'Psicólogo no encontrado' });
        }

        res.status(200).json({ perfil });
    } catch (error) {
        console.error('Error al obtener perfil del psicólogo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const obtenerHistorial = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const historial = await psicologoModel.obtenerHistorial(estudiante_id);
        res.json(historial);
    } catch (error) {
        console.error("Error al obtener historial de cancelaciones:", error);
        res.status(500).json({ error: "Error al obtener historial de cancelaciones" });
    }
};

const verificarConexionCalendarController = async (req, res) => {
    try {
        const { psicologo_id } = req.params;
        const conectado = await psicologoModel.verificarConexionGoogleCalendar(psicologo_id);
        res.json({ conectado });
    } catch (error) {
        console.error("Error al verificar conexión:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
};

module.exports = {
    loginGooglePsicologo,
    iniciarOAuthGoogleCalendar,
    googleCalendarCallback,
    obtenerDisponibilidadPorId,
    listarPsicologos,
    obtenerCitasDelPsicologo,
    cambiarEstadoCita,
    obtenerPsicologoPorUsuarioId,
    obtenerCitasAceptadas,
    cancelarCitaPsicologo,
    obtenerHorasOcupadas,
    crearCitaSeguimiento,
    estudiantePorPsicologo,
    obtenerPerfilPsicologo,
    obtenerHistorial,
    verificarConexionCalendarController,
};