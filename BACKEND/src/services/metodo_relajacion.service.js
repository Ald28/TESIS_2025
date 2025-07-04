const cloudinary = require('./cloudinary.service');

const MetodoRelajacionService = {
    async subirArchivoACloudinary(buffer) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: "auto", folder: "metodos_relajacion" },
                (error, result) => {
                    if (error) reject(new Error(`Error en Cloudinary: ${error.message}`));
                    else resolve(result.secure_url);
                }
            );
            stream.end(buffer);
        });
    }
};

module.exports = MetodoRelajacionService;