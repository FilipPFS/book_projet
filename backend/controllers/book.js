const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {

    let indexOfDot = req.file.filename.lastIndexOf(".");
    const myFile = req.file.filename;
    console.log("My file", myFile);
    
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;

        const newBook = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.substring(0, indexOfDot)}.webp`
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
            res.status(401).json({ message: 'Not authorized' });
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
    const trimmedImageUrl = book.imageUrl.replace('http://localhost:4000', '').split('/images/')[1];
    console.log("url", trimmedImageUrl);

    try {
        let bookObject;

        if (req.file) {
            bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            };

            
            fs.unlink(`images/${trimmedImageUrl}`, (err) => {
                if (err) {
                    console.error('Error deleting image:', err);
                } else {
                    console.log('Old image deleted successfully');
                }
            });
        } else {

            bookObject = { ...JSON.parse(req.body.book) };
        }

        delete bookObject._userId;


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
        console.log(error);
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
        res.status(500).json({ message: "Error" });
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
            return res.status(404).json({ error: 'Book not found' });
        }

        if (existingRating) {
            return res.status(400).json({ error: 'You have already voted.' });
        }

        if (!grade) {
            return res.status(400).json({ error: 'Grade is required' });
        }


        book.ratings.push({ userId, grade });

        const totalRatings = book.ratings.length;
        const totalRatingSum = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = +(totalRatingSum / totalRatings).toFixed(1);

        await book.save();

        console.log("The book", book);
        res.status(201).json({ book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




