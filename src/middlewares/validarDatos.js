const validarDatos = (req, res, next) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        return res.status(400).json({ error: "Faltan datos necesarios en la solicitud." });
    }
    
    next();
};

module.exports = validarDatos;