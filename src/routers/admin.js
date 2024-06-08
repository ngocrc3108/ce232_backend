require("dotenv").config();
const express = require('express');
const route = express.Router();
const deviceController = require('../controller/admin');

const authenticateAdmin = (req, res, next) => {
    if(req.query.key == process.env.SECRET_KEY)
        next();
    else
        res.send({message: "wrong key"});
}

route.use(authenticateAdmin);
route.get('/:type/create', deviceController.create);

module.exports = route