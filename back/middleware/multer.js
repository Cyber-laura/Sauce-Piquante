const multer = require("multer")

// Configuration de Multer pour stocker les fichiers dans le répertoire 'images/' avec nom de fichier unique (makeFilename)
const storage = multer.diskStorage({
    destination: "images/",
    filename: makeFilename
})
// Fonction pour créer un nom de fichier unique
function makeFilename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
}

const upload = multer({ storage: storage })

module.exports = { upload }