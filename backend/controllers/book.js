const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {

    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;

        const thing = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })

        await thing.save();
        res.status(201).json({ message: 'Objet enregistré !' })
    } catch (error) {
        res.status(400).json({ error })
    }
}

exports.getBooks = async (req, res, next) => {

    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.getOneBook =  async (req, res, next) => {

    try {
        const book = await Book.findOne({ _id: req.params.id })
        res.status(200).json(book);
    } catch (err) {
        res.status(404).json(err)
    }
}

exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id })
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized' });
        } else {
            try {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, async () => {
                    await Book.deleteOne({ _id: req.params.id })
                    res.status(200).json({ message: 'Objet supprimé !' })
                })
                } catch (error) {
                res.status(401).json({ error })
            }
        }
    } catch (err) {
        res.status(400).json({ err });
    }
}

exports.editBook = async (req, res, next) => {
    try {
        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

        delete bookObject._userId;


        const book = await Book.findOne({ _id: req.params.id });

        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized' });
        } else {
            try {
                await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                res.status(200).json({ message: 'Objet modifié!' })
            } catch (error) {
                res.status(401).json({ error })
            }
        }
    } catch (error) {
        res.status(400).json({ error });
    }
}

exports.getTopRated = async (req, res, next) => {
    try {
        const allBooks = await Book.find();

        const booksWithAverageRating = allBooks.map(book => {
            if (book.ratings.length === 0) {
                return { ...book.toObject(), averageRating: 0 };
            }
            const averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;
            return { ...book.toObject(), averageRating };
        });

        booksWithAverageRating.sort((a, b) => b.averageRating - a.averageRating);

        const topRatedBooks = booksWithAverageRating.slice(0, 3);

        res.status(200).json(topRatedBooks);
    } catch (error) {
        res.status(500).json({ message: "Error"});
    }
};




