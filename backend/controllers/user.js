const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signup = async (req, res, next) => {
    try {
        const hashedPass = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPass
        })

        await user.save();
        res.status(201).json({ message: "Utilisateur crée."})
    } catch(error) {
        res.status(500).json( {error} )
    }
}

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(user === null) {
            res.status(401).json({ message: "Paire identifiant/mot de passe est incorrect."}) //  Unauthozired
        } else {
            const thePass = await bcrypt.compare(req.body.password, user.password);
            if(!thePass) {
                res.status(401).json({ message: "Paire identifiant/mot de passe est incorrect."})
            } else {
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id},
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: "24h" }
                    )
                });
            }
        }
    } catch(err) {
        res.status(500).json( {err} )
    }
};