const multer = require('multer');

const storage = multer.memoryStorage(); // almacena el archivo en memoria para subirlo a Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = upload;