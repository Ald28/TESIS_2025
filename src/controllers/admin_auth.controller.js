const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin.model');

const loginAdmin = async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
    }

    try {
        const admin = await adminModel.buscarAdminPorCorreo(correo);

        if (!admin) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const passwordValida = await bcrypt.compare(contrasena, admin.contrasena);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: admin.id, rol_id: admin.rol_id, correo: admin.correo },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            admin: {
                id: admin.id,
                nombre: admin.nombre,
                apellido: admin.apellido,
                correo: admin.correo,
                rol_id: admin.rol_id
            }
        });

    } catch (error) {
        console.error('Error en loginAdmin:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

const obtenerEstudiantes = async (req, res) => {
    try {
        const estudiantes = await adminModel.listarEstudiantes();
        res.status(200).json({ ok: true, datos: estudiantes });
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ ok: false, mensaje: "Error del servidor" });
    }
};

const obtenerPsicologos = async (req, res) => {
    try {
        const psicologos = await adminModel.listarPsicologos();
        res.status(200).json({ ok: true, datos: psicologos });
    } catch (error) {
        console.error("Error al obtener psicólogos:", error);
        res.status(500).json({ ok: false, mensaje: "Error del servidor" });
    }
};

const crearTurnoPsicologo = async (req, res) => {
  try {
    const { dia, mañana_inicio, mañana_fin, tarde_inicio, tarde_fin, psicologo_id } = req.body;
    console.log("Datos recibidos:", req.body);

    if (!dia || !mañana_inicio || !mañana_fin || !tarde_inicio || !tarde_fin || !psicologo_id) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    try {
      await adminModel.crearDisponibilidad(dia, mañana_inicio, mañana_fin, 'mañana', psicologo_id);
    } catch (error) {
      if (error.message.includes("horario")) {
        console.error("Error en crearDisponibilidad:", error);
        return res.status(400).json({ mensaje: error.message });
      }
      console.warn("Turno mañana duplicado:", error.message);
    }

    try {
      await adminModel.crearDisponibilidad(dia, tarde_inicio, tarde_fin, 'tarde', psicologo_id);
    } catch (error) {
      if (error.message.includes("horario")) {
        console.error("Error en crearDisponibilidad:", error);
        return res.status(400).json({ mensaje: error.message });
      }
      console.warn("Turno tarde duplicado:", error.message);
    }

    return res.status(201).json({ mensaje: "Disponibilidad creada (evitando duplicados)." });

  } catch (error) {
    console.error("❌ Error al crear disponibilidad:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
};

const listarDisponibilidadPorTurno = async (req, res) => {
  try {
    const { psicologo_id } = req.params;
    const disponibilidad = await adminModel.listarDisponibilidadPorTurno(psicologo_id);
    res.status(200).json({ disponibilidad });
  } catch (error) {
    console.error("Error al obtener disponibilidad por turnos:", error);
    res.status(500).json({ mensaje: "Error al obtener disponibilidad" });
  }
};

const registrarPsicologo = async (req, res) => {
  try {
    const { nombre, apellido, correo, especialidad, descripcion } = req.body;

    if (!nombre || !apellido || !correo || especialidad) {
      return res.status(400).json({ mensaje: "Todos los campos obligatorios deben estar completos." });
    }

    const usuario_id = await adminModel.registrarUsuarioPsicologoPreRegistro({
      nombre,
      apellido,
      correo,
      especialidad,
      descripcion
    });

    res.status(201).json({
      ok: true,
      mensaje: "Psicólogo registrado correctamente como pre-registro",
      usuario_id,
    });
  } catch (error) {
    console.error("Error al registrar psicólogo:", error.message);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

module.exports = {
    loginAdmin,
    obtenerEstudiantes,
    obtenerPsicologos,
    crearTurnoPsicologo,
    listarDisponibilidadPorTurno,
    registrarPsicologo
};