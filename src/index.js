const express = require("express")
const axios = require("axios")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const {PORT } = require("./config/serverConfig")
app.use(cors({
    origin: "chrome-extension://nhcedjihkckghggeehhjfghkedamglda",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const apiRouter = require('./route/index')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/api', apiRouter)
app.get('/', (req, res) => {
    res.send("Everything works fine for now...")
})
app.listen(PORT,()=>{
    console.log("On port : ", PORT);
})