const express = require('express')
const authenRoute = express.Router()
const { body } = require("express-validator")
const authController = require('../controller/authController')

authenRoute.post("/register", [
    body("password", "Password must be between 5 and 20 characters")
    .trim()
    .isLength({min : 5, max : 20})
    .escape(),
    body("username", "Username must be between 5 and 20 characters")
    .trim()
    .isLength({min : 5, max : 20})
    .escape(),
    authController.register
])

authenRoute.post("/login", authController.login)
authenRoute.post("/logout", authController.logout)

module.exports = authenRoute