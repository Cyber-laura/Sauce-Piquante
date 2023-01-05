const express = require('express');
const app = express();
const port = 3000

// Connexion à MongoDB
const mongo = require("./mongo")

// Controllers
const {createUser, login} = require("./controllers/users");

// Middleware CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json())

// Routes 
app.post("/api/auth/signup", createUser);
app.post("/api/auth/login", login)
app.get('/', (req, res) =>{
    res.send('Hello Worl!')
});

app.listen(port, () =>{
    console.log('Example app listening on port'+ port)
});




