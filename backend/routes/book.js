const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/multer.config");
const router = express.Router();

const bookCtrl = require("../controllers/book");

router.post('/', auth, upload, bookCtrl.createBook);
router.put("/:id", auth, upload, bookCtrl.editBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.get('/', bookCtrl.getBooks);
router.get('/bestrating', bookCtrl.getTopRated);
router.get('/:id', bookCtrl.getOneBook);


module.exports = router;