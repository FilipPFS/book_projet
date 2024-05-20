const multer = require('multer');
const sharp = require('sharp');
const fs = require("fs");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.replace(/\.[^/.]+$/, '').split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({storage: storage}).single('image');

const optimized = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalImagePath = req.file.path;
  console.log("Path", originalImagePath);

  sharp(originalImagePath)
    .resize({ width: 400 }) // Adjust dimensions as needed
    .webp({ quality: 80 }) // Adjust quality as needed
    .toFile('images/' + req.file.filename.replace(/\.[^/.]+$/, ".webp"), (err, info) => {
      if (err) {
        return next(err);
      }
      
      fs.unlink(originalImagePath, (err) => {
        if (err) {
          console.error('Error deleting original image:', err)}
        next(); 
      });
    });
};


module.exports = {upload, optimized}