const { createUser, login } = require("../controllers/users");

const express = require("express")
const authRouter = express.Router()

authRouter.post("/signup", createUser);
authRouter.post("/login", login);


module.exports = {authRouter}