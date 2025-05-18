const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
    console.log("Headers recibidos:", req.headers);
    const token = req.headers['authorization']?.split(" ")[1];
    console.log("Token recibido en la request:", req.headers['authorization']);

    if (!token) {
        return res.status(401).json({ mensaje: "Token no proporcionado." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ mensaje: "Token inválido." });
        }
        req.usuario = decoded;
        next();
    });
}

module.exports = { verificarToken };