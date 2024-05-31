const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require('dotenv').config();

const app = express();

const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");

mongoose.connect("mongodb+srv://filipPbg:petrovic123@cluster0.2a9vmjz.mongodb.net/bookapp?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Connexion à MongoDB échouée !', err));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;