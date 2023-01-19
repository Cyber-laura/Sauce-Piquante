const jwt = require("jsonwebtoken");

// On vérifie le TOKEN de l'utilisateur, s'il correspond à l'id de l'utilisateur dans la reqête, il sera autorisé à changer les données correspondantes.

//Ce middleware sera appliqué à toutes les routes afin de les sécuriser
function loginUser(req, res, next) {
    
    // On récupère le token dans le header de la requête Authorization
    const header = req.header("Authorization")
    if (header == null) return res.status(403).send({ message: "invalid" })

    // On récupère uniquement le deuxième élément
    const token = header.split(" ")[1]
    if (token == null) return res.status(403).send({ message: "token cannot be null" })

    // On vérifie le token décodé  
    const decodedToken = jwt.verify(token, process.env.JWT_PASS)
    if (decodedToken == null) return res.status(403).send({ message: "token invalid" + err })
    
    // On vérifie que le userId correspond au userId encodé dans le token
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId){
        throw 'userId non valide'; // si le token ne correspond pas au userId : erreur
    } else {
        next()
    }
}

module.exports = { loginUser }