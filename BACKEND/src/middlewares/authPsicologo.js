const jwt = require('jsonwebtoken');

const authPsicologo = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('🔐 authHeader:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido o malformado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    if (decoded.rol !== 1) {
      return res.status(403).json({ message: 'Acceso denegado para rol diferente a psicólogo' });
    }
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authPsicologo;