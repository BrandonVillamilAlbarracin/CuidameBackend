// multerConfig.js

const multer = require('multer');

const configureMulter = (uploadDirectory, prefix) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, uploadDirectory);
      },
      filename: (req, file, callback) => {
        const ext = file.originalname.split('.').pop();
        callback(null, `${prefix}_${Date.now()}.${ext}`);
      },
    }),
    limits: { fileSize: 30 * 1024 * 1024 },
  });
};

// Configuración para la carga de archivos de perfil de mascotas
const petUploadDirectory = '/home/developer/uploads/pets/profile';
const petUploadPrefix = 'PET';
const petUpload = configureMulter(petUploadDirectory, petUploadPrefix);


// Configuración para la carga de archivos de perfil de mascotas
const profileUploadDirectory = '/home/developer/uploads/person/profile';
const profileUploadPrefix = 'PER';
const profileUpload = configureMulter(profileUploadDirectory, profileUploadPrefix);

// Configuración para la carga de archivos de vacunas de mascotas
const vaccineUploadDirectory = '/home/developer/uploads/pets/vaccine';
const vaccineUploadPrefix = 'VAC';
const vaccineUpload = configureMulter(vaccineUploadDirectory, vaccineUploadPrefix);

module.exports = { profileUpload, vaccineUpload, petUpload };
