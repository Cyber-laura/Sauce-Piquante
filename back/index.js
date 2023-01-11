const { app, express } = require("./server")
// const {saucesRouter} = require("./routers/sauces.router")
// const {authRouter} = require("./routers/auth.router")

const port = 3000
const path = require('path')
const bodyParser = require("body-parser")

// Connexion à MongoDB
const mongo = require("./mongo")

//Controllers
const { createUser, login } = require("./controllers/users");
const { getSauces, createSauces, getSaucesById, deleteSauce, modifySauces,likeSauces} = require("./controllers/sauces");


// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const {loginUser} = require("./middleware/auth")
const { upload } = require("./middleware/multer.js")

// Routes

app.post("/api/auth/signup", createUser);
app.post("/api/auth/login", login);

app.get("/api/sauces", loginUser, getSauces);
app.post("/api/sauces", loginUser, upload.single("image"), createSauces);
app.get("/api/sauces/:id", loginUser, getSaucesById);
app.delete("/api/sauces/:id", loginUser, deleteSauce);
app.put("/api/sauces/:id", loginUser, upload.single("image"), modifySauces);

app.post("/api/sauces/:id/like",loginUser, likeSauces );

app.get('/', (req, res) => { res.send('Hello Worl!') });

//Listen
app.use('/images', express.static(path.join(__dirname, "images")))
app.listen(port, () => { console.log('Example app listening on port' + port) });




