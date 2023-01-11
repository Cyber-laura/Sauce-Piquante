const jwt = require("jsonwebtoken");

function loginUser(req, res, next) {
    console.log("login user")
    const header = req.header("Authorization")
    if (header == null) return res.status(403).send({ message: "invalid" })

    const token = header.split(" ")[1]
    if (token == null) return res.status(403).send({ message: "token cannot be null" })

    jwt.verify(token, "RANDOM_TOKEN_SECRET", (err, decoded) => {
        if (err) return res.status(403).send({ message: "token invalid" + err })
        console.log("le token est valide continuons !")
        next()
    })
}

module.exports = { loginUser }