const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {
    
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;

        console.log("bOOK", bookObject);

        const newBook = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        await newBook.save();

        res.status(201).json({ message: 'Book created successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating book' });
    }
};

exports.getBooks = async (req, res, next) => {

    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (err) {
        res.status(400).json(err)
    }
}

exports.getOneBook = async (req, res, next) => {

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
            res.status(403).json({ message: 'Not authorized' });
        } else {
            try {
                const filename = book.imageUrl.split('/images/')[1];
                console.log("Filename", filename);
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

    const book = await Book.findOne({ _id: req.params.id });
    const trimmedImageUrl = book.imageUrl.split('/images/')[1];
    console.log("url", trimmedImageUrl);

    try {
        let bookObject;

        if (req.file) {
            bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            };

            console.log("Req file", req.file);

            
            fs.unlink(`images/${trimmedImageUrl}`, (err) => {
                if (err) {
                    console.error('Error lors de la supression:', err);
                } else {
                    console.log('Old image deleted successfully');
                }
            });
        } else {
            bookObject = { ...req.body };
        }

        delete bookObject._userId;


        if (book.userId != req.auth.userId) {
            res.status(403).json({ message: 'Not authorized' });
        } else {
            try {
                await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                res.status(200).json({ message: 'Objet modifié!' })
            } catch (error) {
                res.status(401).json({ error })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
}

exports.getTopRated = async (req, res, next) => {
    try {
        const allBooks = await Book.find();

        allBooks.sort((a, b) => b.averageRating - a.averageRating);

        const topRatedBooks = allBooks.slice(0, 3);

        res.status(200).json(topRatedBooks);
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
};

exports.addBookRating = async (req, res, next) => {

    console.log("Req", req.body);
    try {
        const bookId = req.params.id;
        const userId = req.auth.userId;
        const grade = req.body.rating;

        const book = await Book.findById(bookId);
        const existingRating = await book.ratings.find(rating => rating.userId === userId);

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        if (existingRating) {
            return res.status(400).json({ message: 'Vous avez déja voté.' });
        }

        book.ratings.push({ userId, grade });

        const totalRatings = book.ratings.length; 
        const totalRatingSum = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = +(totalRatingSum / totalRatings).toFixed(1);

        const SingleBook = await book.save();

        res.status(201).json(SingleBook);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




