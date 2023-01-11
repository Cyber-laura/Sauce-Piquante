const mongoose = require("mongoose");
const {unlink} = require("fs")

// Product est un modèle Mongoose qui est créé à partir du schéma productSauces et qui permet de manipuler "Product" de la base de données MongoDB.
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
const Product = mongoose.model("Product", productSauces)

// La fonction getSauces utilise la méthode find de Mongoose pour récupérer tous les documents de la collection "Product" de la base de données, puis envoie ces documents à la réponse via res.send(products). 
// En cas d'erreur, elle envoie un statut HTTP 500 avec l'erreur.
function getSauces(req, res) {
    Product.find({})
        .then(products => res.send(products))
        .catch(error => res.status(500)
            .send(error))
}
// La fonction getSaucesById utilise la méthode findById de Mongoose pour récupérer le document ayant un certain ID dans la collection "Product" de la base de données, puis envoie ce document à la réponse via res.send(product). En cas d'erreur, elle utilise console.err pour afficher l'erreur.
function getSaucesById(req, res) {
    const { id } = req.params
    Product.findById(id)
        .then(product => res.send(product))
        .catch(console.err)
}
// La fonction deleteSauce utilise la méthode findByIdAndDelete de Mongoose pour supprimer un document ayant un certain ID dans la collection "Product" de la base de données.
//puis utilise la fonction deleteImage pour supprimer l'image associé.
function deleteSauce(req, res){
    const {id} = req.params
    Product.findByIdAndDelete(id)
        .then(deleteImage)
        .then((product) => res.send({message:product }))
        .catch((err) => res.status(500).send({message:err}))
}
// La fonction deleteImage utilise fs.unlink pour supprimer un fichier image spécifié par le chemin d'accès de l'image.
function deleteImage(product){
    const {imageUrl} =  product
    const fileToDelete = imageUrl.split("/").at(-1)
    unlink(`images/${fileToDelete}`, (err)=>{
        console.error(err)
    })
    return product
}
// La fonction modifySauces utilise la méthode findByIdAndUpdate de Mongoose pour mettre à jour un document ayant un certain ID dans la collection "Product" de la base de données.
// et utilise la fonction deleteImage pour supprimer l'ancienne image associé si une nouvelle image est associé.
function modifySauces(req, res) {
    const 
    {params: {id}} 
    = req

    const hasNewImage = req.file != null
    const payload = makePayload(hasNewImage, req)
    
    Product.findByIdAndUpdate(id, payload)
    .then((response) =>{
        if(response !=null){
            console.log("updating ok", response)
            return Promise.resolve(res.status(200).send({message :"maj ok"}))
            .then(
                () => response
                )
        }else{
            console.log("Rien a update")
            return res.statuts(404).send({message:"Objet non trouvé"})
        }
    })
    .then((response)=> deleteImage(response))
    .catch(err => console.error("Probleme Updating", err))
}
//La fonction deleteImage prend en entrée un paramètre response qui est un document de la base de données et supprime l'image associée à ce document.
// Elle utilise la fonction unlink pour supprimer un fichier image spécifié par le chemin d'accès de l'image, s'il y a une réponse non nulle.
function deleteImage(response){
    if (response == null) return
    console.log("DELETE IMAGE", response)
    const imageToDelete = response.imageUrl.split("/").at(-1)
    unlink(`images/${imageToDelete}`, (err)=>{
        if (err) throw err;
        console.log("supprimé")
    })
}
// La fonction makePayload prend en entrée un paramètre hasNewImage qui indique s'il y a une nouvelle image associée, et un paramètre req qui est la requête HTTP. Cette fonction analyse la requête pour extraire les informations nécessaires pour mettre à jour un produit dans la base de données. Elle renvoie un objet contenant les champs à mettre à jour. Si il n'y a pas de nouvelle image associée, elle retourne simplement req.body
function makePayload(hasNewImage, req){
    console.log("hasNewImage" , hasNewImage)
    // si il n'y a pas de new image return req.body
    if (!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename
    console.log("nouvel image a gérer")
    console.log("voici le payload:", payload)
    return payload
}
//La fonction createSauces prend en entrée une requête HTTP et une réponse. Elle utilise les informations de la requête pour créer un nouveau document dans la collection "Product" de la base de données. Elle utilise les informations de la requête pour extraire les détails du produit, et l'image associée est récupérée à partir de req.file.
function createSauces(req, res) {
    const sauce = JSON.parse(req.body.sauce)

    const name = sauce.name
    const manufacturer = sauce.manufacturer
    const description = sauce.description
    const mainPepper = sauce.mainPepper
    const heat = sauce.heat
    const userId = sauce.userId

    console.log('sauces:', sauce)

    console.log({ body: req.body.sauce })
    console.log({ file: req.file })
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
        .catch((err)=> res.status(500).send({message:err}))
}
// La fonction sendClientResponse prend en entrée un document produit et une réponse. Elle vérifie s'il y a des produits à mettre à jour, sinon elle envoie un message d'erreur. Sinon elle envoie un message de succès.
function sendClientResponse(product, res){
    if(product == null){
        console.log("Rien a UPDATE")
        return res.status(404).send({message : "l'objet n'est pas trouvé"})
    }
    console.log("OK UPDATING:", product)
    return Promise.resolve(res.status(200).send(product)).then(()=> product)
}
// La fonction likeSauces prend en entrée une requête HTTP et une réponse. Il incrémente les votes d'un produit en fonction de si c'est un vote positif ou négatif, et envoie une réponse au client. Il utilise la fonction voteSauces pour incrémenter les votes et la fonction resetVote pour vérifier que l'utilisateur n'a pas déjà voté pour ce produit.
function likeSauces (req, res){
    const userId = req.body.userId
    const {id} = req.params
    const like = req.body.like
    console.log("Fonction like sauce invoqué", {like})

    if (![0, -1, 1].includes(like)) return res.status(403).send({message: "bad request"})

    return Product.findById(id)
    .then((product)=> voteSauces(product, like, userId, res))
    .then(produit => produit.save())
    .then((prod) => sendClientResponse(prod,res))
    .catch((err)=> res.status(500).send(err))
}

// La fonction voteSauces prend en entrée un produit, un vote (positif ou négatif) et un utilisateur, et incrémente les votes en conséquence. Elle utilise la fonction resetVote pour vérifier que l'utilisateur n'a pas déjà voté pour ce produit.
function voteSauces(product, like, userId, res){
    if (like === 1 || like === -1) return incrementVotes(product, userId, like)
    return resetVote(product, userId, res)
    // return product.save()
}
// La fonction resetVote prend en entrée un produit et un utilisateur, et vérifie que l'utilisateur n'a pas déjà voté pour ce produit. Si c'est le cas, elle envoie une erreur. Sinon, elle annule les votes précédents de l'utilisateur pour ce produit.
function resetVote(product, userId, res){
    console.log("Reset Vote", product)
    const {usersLiked, usersDisliked }= product
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("le user a voté pour les deux")

    if(![usersLiked, usersDisliked].some((arr) => arr.includes(userId))) 
    return Promise.reject("le user semble ne pas avoir voté")

    if (usersLiked.includes(userId)){
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
    }else{
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
    }

    let arrayToUpdate = usersLiked.includes(userId) ? usersLiked : usersDisliked
    const arrayWithoutUser = arrayToUpdate.filter((id) => id !== userId)
    arrayToUpdate = arrayWithoutUser
    return product
}    

function incrementVotes(product, userId, like){
    const {usersLiked, usersDisliked} = product

    const votersArray = like === 1 ? usersLiked : usersDisliked
    if (votersArray.includes(userId)) return product
    votersArray.push(userId)

    let voteToUpdate
    if (like ===1){
        voteToUpdate = product.likes
        product.likes = ++voteToUpdate
    }else{
        voteToUpdate = product.dislikes
        product.dislikes = ++voteToUpdate
    }
    // like ===1? ++product.likes : ++product.dislikes
    return product

}



module.exports = { getSauces, createSauces, getSaucesById, deleteSauce, modifySauces,likeSauces}