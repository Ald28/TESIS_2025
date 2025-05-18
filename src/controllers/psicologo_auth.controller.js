const { guardarTokensPsicologo, crearEventoPsicologo, eliminarEventoGoogleCalendar } = require('../services/google_calendar.service');
const { enviarCorreoCitaAceptada } = require('../services/email.service');
const { verifyGoogleToken } = require('../services/googleAuth.service');
const psicologoModel = require('../models/psicologo.model');
const estudianteModel = require('../models/estudiante.model');
const usuarioModel = require('../models/usuario');
const citaModel = require('../models/cita.model');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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
    'http://localhost:8080/auth/psicologo/google/calendar-callback'
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

            if (!cita) {
                return res.status(404).json({ message: 'Cita no encontrada' });
            }

            const estudiante = await psicologoModel.obtenerNombreCompletoEstudiante(cita.estudiante_id);
            const nombreEstudiante = estudiante?.nombre_completo || 'Estudiante';

            const psicologo = await psicologoModel.obtenerNombreCompletoPsicologo(cita.usuario_psicologo);
            const nombrePsicologo = psicologo?.nombre_completo || 'Psicólogo';
            const correoPsicologo = psicologo?.correo;

            if (!correoPsicologo) {
                return res.status(400).json({ message: 'No se encontró el correo del psicólogo' });
            }

            const evento = {
                summary: `Cita psicológica: ${nombreEstudiante} con ${nombrePsicologo}`,
                description: `Sesión entre ${nombreEstudiante} y ${nombrePsicologo}. Consulta programada por el sistema.`,
                start: new Date(cita.fecha_inicio).toISOString(),
                end: new Date(cita.fecha_fin).toISOString(),
                attendees: [{ email: cita.correo_usuario }]
            };

            const eventoCreado = await crearEventoPsicologo(correoPsicologo, evento);
            evento_google_id = eventoCreado.id;

            const fechaLocal = new Date(cita.fecha_inicio).toLocaleDateString('es-PE');
            const horaInicioLocal = new Date(cita.fecha_inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
            const horaFinLocal = new Date(cita.fecha_fin).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            await enviarCorreoCitaAceptada({
                para: cita.correo_usuario,
                nombreEstudiante,
                fecha: fechaLocal,
                horaInicio: horaInicioLocal,
                horaFin: horaFinLocal
            });
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

        if (resultado.exito) {
            return res.status(200).json({ message: 'Cita cancelada correctamente' });
        } else {
            return res.status(400).json({ message: resultado.mensaje });
        }

    } catch (error) {
        console.error('❌ Error al cancelar cita:', error);
        res.status(500).json({ message: 'Error al cancelar cita' });
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

        const fecha_inicio = new Date(`${fecha}T${hora_inicio}`);
        const fecha_fin = new Date(`${fecha}T${hora_fin}`);

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
};