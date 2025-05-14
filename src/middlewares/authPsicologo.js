const jwt = require('jsonwebtoken');

const authPsicologo = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol !== 1) {
      return res.status(403).json({ message: 'Acceso denegado para rol diferente a psicólogo' });
    }
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authPsicologo;