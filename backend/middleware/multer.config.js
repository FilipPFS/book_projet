const multer = require('multer');
const sharp = require('sharp');
const fs = require("fs");
const path = require("path");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

const optimized = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const name = req.file.originalname.replace(/\.[^/.]+$/, '').split(' ').join('_');
  const filename = name + Date.now() + '.webp';
  const outputPath = path.join('images', filename);

  sharp(req.file.buffer)
    .resize({ width: 400 })
    .webp({ quality: 50 })
    .toFile(outputPath, (err, info) => {
      if (err) {
        return next(err);
      }
      
      fs.readdir('images', (err, files) => {
        if (err) {
          console.error('Error reading images directory:', err);
          return next(err);
        }

        req.file.path = outputPath;
        req.file.filename = filename;
        next();
      });
    });
};

module.exports = { upload, optimized };
