const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// fichier dotenv
const jwtPassword = process.env.JWT_PASS

//Importation de user depuis mongo.js
const { User } = require("../mongo")

// Création  d'un utilisateur
async function createUser(req, res) {
    const email = req.body.email
    const password = req.body.password
    // hachage du mot de passe
    const hashedPassword = await hashPassword(password)
    const user = new User({ email, password: hashedPassword })

    user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
}

// Fonction pour hacher le mot de passe
function hashPassword(password) {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
}

// Méthode pour se connecter
function login(req, res) {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    // Génération d'un jeton d'authentification (token)
                    res.status(200).json({
                        userId: user._id,
                        email: req.body.email,
                        token: jwt.sign(
                            { userId: user._id, email: req.body.email },
                            jwtPassword,
                            { expiresIn: '24h' })
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

module.exports = { createUser, login };