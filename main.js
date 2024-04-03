require('dotenv').config()
const {mqttRouteInit, mqtt} = require('./src/mqtt')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const authenticate = require('./src/routers/authenticate')
const {findUserBySeassion} = require('./src/controller/authController')
const cors = require('cors')
const deviceController = require('./src/routers/device')

mqttRouteInit()

// constaints
const PORT = process.env.PORT || 4001 
const http = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})

let sessionOption = {
    secret : process.env.SECRET_KEY,
    resave : true,
    saveUninitialized : true
}

if(process.env.NODE_ENV === 'production') {
    console.log("app is running on production")
    sessionOption = {...sessionOption, 
        cookie : {sameSite: 'none', secure : true}
    }
    console.log("sessionOption", sessionOption)
    app.set("trust proxy", 1); // -------------- FIRST CHANGE ----------------
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Origin", "https://my.godaddy.subdomain");
        res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override, Set-Cookie, Cookie");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        next();  
     });    // --------------- SECOND CHANGE -------------------
    app.use(cors({
        origin : "https://ce232-fontend.onrender.com",
        credentials : true
    }))
}

const sessionMiddleware = session(sessionOption)

global.io = require("socket.io")(http)
io.engine.use(sessionMiddleware)
io.on("connection", function(socket) {
    const sessionId = socket.request.session.id;
    socket.join(sessionId);
    console.log("socket connected")
})

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
            console.log("Connect to db")
    })
    .catch((err) => console.log(err))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(sessionMiddleware)
app.use('/auth', authenticate)
app.use(findUserBySeassion) // require user login
app.use('/device', deviceController)