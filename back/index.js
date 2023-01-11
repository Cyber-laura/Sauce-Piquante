const { app, express } = require("./server")
const {saucesRouter} = require("./routers/sauces.router")
const {authRouter} = require("./routers/auth.router")

const port = 3000
const path = require('path')
const bodyParser = require("body-parser")

// Connexion à MongoDB
const mongo = require("./mongo")

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use("/api/auth", authRouter)
app.use("/api/sauces", saucesRouter )

//Routes

app.get('/', (req, res) => { res.send('Hello Worl!') });

//Listen
app.use('/images', express.static(path.join(__dirname, "images")))
app.listen(port, () => { console.log('Example app listening on port' + port) });




