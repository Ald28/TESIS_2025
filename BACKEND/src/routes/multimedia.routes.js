// CAMBIAR PERFIL ESTUDIANTE
const express = require("express");
const router = express.Router();
const { upload, subirImagen } = require("../controllers/upload.controller");

router.post("/upload", upload.single("imagen"), subirImagen);

module.exports = router;