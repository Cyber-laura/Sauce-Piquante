const express = require("express")
const saucesRouter = express.Router()

const { getSauces, createSauces, getSaucesById, deleteSauce, modifySauces, likeSauces } = require("../controllers/sauces");

const { loginUser } = require("../middleware/auth")
const { upload } = require("../middleware/multer.js")

saucesRouter.get("/", loginUser, getSauces);
saucesRouter.post("/", loginUser, upload.single("image"), createSauces);
saucesRouter.get("/:id", loginUser, getSaucesById);
saucesRouter.delete("/:id", loginUser, deleteSauce);
saucesRouter.put("/:id", loginUser, upload.single("image"), modifySauces);
saucesRouter.post("/:id/like", loginUser, likeSauces);

module.exports = { saucesRouter }