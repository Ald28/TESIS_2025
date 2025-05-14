const multer = require('multer');

const storage = multer.memoryStorage(); // almacena el archivo en memoria para subirlo a Cloudinary
const upload = multer({ storage });

module.exports = upload;