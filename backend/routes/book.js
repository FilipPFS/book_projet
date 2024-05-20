const express = require("express");
const auth = require("../middleware/auth");
const {upload, optimized} = require("../middleware/multer.config");
const router = express.Router();

const bookCtrl = require("../controllers/book");

router.post('/', auth, upload, optimized, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.addBookRating);
router.put("/:id", auth, upload, bookCtrl.editBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.get('/', bookCtrl.getBooks);
router.get('/bestrating', bookCtrl.getTopRated);
router.get('/:id', bookCtrl.getOneBook);


module.exports = router;