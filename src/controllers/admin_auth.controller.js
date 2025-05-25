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
    const { estado } = req.query;
    const psicologos = await adminModel.listarPsicologos(estado);
    res.status(200).json({ ok: true, datos: psicologos });
  } catch (error) {
    console.error("Error al obtener psicólogos:", error);
    res.status(500).json({ ok: false, mensaje: "Error del servidor" });
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

    if (!nombre || !apellido || !correo) {
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

const eliminarPsicologo = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    console.log("ID del psicólogo a eliminar:", usuario_id);

    if (!usuario_id) {
      return res.status(400).json({ mensaje: "El ID del psicólogo es obligatorio." });
    }

    const resultado = await adminModel.eliminarPsicologo(usuario_id);

    if (resultado === 0) {
      return res.status(404).json({ mensaje: "Psicólogo no encontrado." });
    }

    res.status(200).json({ mensaje: "Psicólogo eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar psicólogo:", error.message);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
}

const activarPsicologo = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    if (!usuario_id) {
      return res.status(400).json({ mensaje: "El ID del psicólogo es obligatorio." });
    }

    const resultado = await adminModel.activarPsicologo(usuario_id);

    if (resultado === 0) {
      return res.status(404).json({ mensaje: "Psicólogo no encontrado." });
    }

    res.status(200).json({ mensaje: "Psicólogo activado correctamente." });
  } catch (error) {
    console.error("Error al activar psicólogo:", error.message);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
};

const editarPsicologo = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { nombre, apellido, correo, especialidad, descripcion } = req.body;

    if (!usuario_id || !nombre || !apellido || !correo) {
      return res.status(400).json({ mensaje: "Datos incompletos para la actualización." });
    }

    await adminModel.actualizarPreRegistro({
      usuario_id,
      nombre,
      apellido,
      correo,
      especialidad,
      descripcion
    });

    res.status(200).json({ ok: true, mensaje: "Datos del psicólogo actualizados correctamente." });

  } catch (error) {
    console.error("Error al editar psicólogo:", error.message);
    res.status(500).json({ ok: false, mensaje: "Error del servidor." });
  }
};


module.exports = {
  loginAdmin,
  obtenerEstudiantes,
  obtenerPsicologos,
  listarDisponibilidadPorTurno,
  registrarPsicologo,
  eliminarPsicologo,
  activarPsicologo,
  editarPsicologo,
};