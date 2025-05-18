// CAMBIAR PERFIL ESTUDIANTE
const cloudinary = require("../services/cloudinary.service");
const streamifier = require("streamifier");
const multer = require("multer");
const multimediaModel = require("../models/multimedia.model");

const upload = multer();

const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    const bufferStream = streamifier.createReadStream(req.file.buffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "perfiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      bufferStream.pipe(stream);
    });

    const multimedia_id = await multimediaModel.insertarMultimedia(uploadResult.secure_url);

    return res.status(200).json({
      message: "Imagen subida con éxito",
      multimedia_id,
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    res.status(500).json({ message: "Error al subir imagen" });
  }
};

module.exports = {
  upload,
  subirImagen,
};