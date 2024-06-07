require("dotenv").config();
const express = require("express");
const app = express();
const path = require('path');
const { mongoStore, mongoOnOpen } = require("./src/mongodb")
const session = require("express-session");
const authenticateRouter = require("./src/routers/authenticate");
const { findUserBySession } = require("./src/controller/authController");
const deivceRouter = require("./src/routers/device");
const {socketInit} = require("./src/socket")
const { mqttInit, mqttPublishAsync } = require("./src/mqtt");
const { ledSchedulerInit } = require('./src/ledScheduler');
// constaints
const PORT = process.env.PORT || 4001;

let sessionOption = {
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store : mongoStore
};

const sessionMiddleware = session(sessionOption);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../ce232_frontend/build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../ce232_frontend/build', 'index.html'));
});
app.use(sessionMiddleware);
app.use("/auth", authenticateRouter);
app.use(findUserBySession); // require user login
app.use("/device", deivceRouter);

mongoOnOpen(async () => {
    const http = app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
    socketInit(http, sessionMiddleware);
    mqttInit();
    ledSchedulerInit();
});