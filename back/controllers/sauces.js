const mongoose = require("mongoose");
const { unlink } = require("fs")

// Création du schéma des sauces
const productSauces = new mongoose.Schema({
    userId: String,
    name: String,
    manufacturer: String,
    description: String,
    mainPepper: String,
    imageUrl: String,
    heat: Number,
    likes: Number,
    dislikes: Number,
    usersLiked: [String],
    usersDisliked: [String]
})
// Création d'un model pour les sauces
const Product = mongoose.model("Product", productSauces)

// Récupération de toutes les sauces
function getSauces(req, res) {
    Product.find({})
        .then(products => res.send(products))
        .catch(error => res.status(500)
            .send(error))
}
// Récupération d'une sauce en fonction de son ID 
function getSaucesById(req, res) {
    const { id } = req.params
    Product.findById(id)
        .then(product => res.send(product))
        .catch(console.err)
}
// Supprime une sauce en fonction de son ID
function deleteSauce(req, res) {
    const { id } = req.params
    Product.findByIdAndDelete(id)
        .then(deleteImage)
        .then((product) => res.send({ message: product }))
        .catch((err) => res.status(500).send({ message: err }))
}
// Supprime l'image d'une sauce
function deleteImage(product) {
    const { imageUrl } = product
    const fileToDelete = imageUrl.split("/").at(-1)
    unlink(`images/${fileToDelete}`, (err) => {
        console.error(err)
    })
    return product
}
// Modifie une sauce en fonction de son ID et supprime l'ancienne image associé si une nouvelle image est généré.
function modifySauces(req, res) {
    const
        { params: { id } }
            = req

    const hasNewImage = req.file != null
    const payload = makePayload(hasNewImage, req)

    Product.findByIdAndUpdate(id, payload)
        .then((response) => {
            if (response != null) {

                return Promise.resolve(res.status(200).send({ message: "maj ok" }))
                    .then(
                        () => response
                    )
            } else {

                return res.statuts(404).send({ message: "Objet non trouvé" })
            }
        })
        .then((response) => deleteImage(response))
        .catch(err => console.error("Probleme Updating", err))
}

// Supprime l'image associée au produit (méthode unlink)
function deleteImage(response) {
    if (response == null) return

    const imageToDelete = response.imageUrl.split("/").at(-1)
    unlink(`images/${imageToDelete}`, (err) => {
        if (err) throw err;

    })
}
// Analyse de la requête puis met a jour le produit dans la base de données
function makePayload(hasNewImage, req) {

    // si il n'y a pas de new image return req.body
    if (!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename

    return payload
}
// Création d'une sauces
function createSauces(req, res) {
    const sauce = JSON.parse(req.body.sauce)

    const name = sauce.name
    const manufacturer = sauce.manufacturer
    const description = sauce.description
    const mainPepper = sauce.mainPepper
    const heat = sauce.heat
    const userId = sauce.userId


    const imageUrl = req.file.destination + req.file.filename

    const product = new Product({
        userId: userId,
        name: name,
        manufacturer: manufacturer,
        description: description,
        mainPepper: mainPepper,
        imageUrl: req.protocol + "://" + req.get("host") + "/" + imageUrl,
        heat: heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
    product
        .save()
        .then((message) => {
            res.status(201).send({ message: message })
            return console.log("product enregistré", res);
        })
        .catch((err) => res.status(500).send({ message: err }))
}
// Envoie une réponse au client 
function sendClientResponse(product, res) {
    // si l'objet n'a pas été trouvé
    if (product == null) {

        return res.status(404).send({ message: "l'objet n'est pas trouvé" })
    }

    // envoie la réponse au client et la sauce maj
    return Promise.resolve(res.status(200).send(product)).then(() => product)
}

// Fonction qui gère les votes pour les sauces
function likeSauces(req, res) {
    const userId = req.body.userId
    const { id } = req.params
    const like = req.body.like


    // Vérifier si la demande est valide
    if (![0, -1, 1].includes(like)) return res.status(403).send({ message: " unauthorized request" })

    return Product.findById(id)
        .then((product) => voteSauces(product, like, userId, res))
        .then(produit => produit.save())
        .then((prod) => sendClientResponse(prod, res))
        .catch((err) => res.status(500).send(err))
}
//Mise à jour ou rénitialisation du vote 
function voteSauces(product, like, userId, res) {
    if (like === 1 || like === -1) return incrementVotes(product, userId, like)
    return resetVote(product, userId, res)
}

// Enlever un like ou dislike
function resetVote(product, userId, res) {

    const { usersLiked, usersDisliked } = product

    // Gestion des cas des erreurs - Vérification du vote de l'utilisateur
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
        return Promise.reject("le user a voté pour les deux")

    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
        return Promise.reject("le user semble ne pas avoir voté")

    //Si l'utilisateur a voté pour, décrémente les likes et supprime l'utilisateur de la liste des utilisateurs qui ont aimé
    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
    }
    // Sinon, décrémente les dislikes et supprime l'utilisateur de la liste des utilisateurs qui n'ont pas aimé
    else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
    }

    let arrayToUpdate = usersLiked.includes(userId) ? usersLiked : usersDisliked
    const arrayWithoutUser = arrayToUpdate.filter((id) => id !== userId)
    arrayToUpdate = arrayWithoutUser
    return product
}

// Incrémente les votes pour une sauce
function incrementVotes(product, userId, like) {
    const { usersLiked, usersDisliked } = product

    const votersArray = like === 1 ? usersLiked : usersDisliked

    if (votersArray.includes(userId)) return product
    votersArray.push(userId)

    // incrémentation des votes
    let voteToUpdate
    if (like === 1) {
        voteToUpdate = product.likes
        product.likes = ++voteToUpdate
    } else {
        voteToUpdate = product.dislikes
        product.dislikes = ++voteToUpdate
    }
    return product
}

module.exports = { getSauces, createSauces, getSaucesById, deleteSauce, modifySauces, likeSauces }