const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const { User } = require("../mongo")

async function createUser(req, res) {
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = await hashPassword(password)
    const user = new User({ email, password: hashedPassword })

    user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
}

function hashPassword(password) {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
}

function login(req, res) {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    console.log(valid)
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

module.exports = { createUser, login };