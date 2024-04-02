const Users = require('../models/users')
const bcrypt = require('bcrypt')
const {validationResult} = require("express-validator")

module.exports.isLoggedIn = (req, res) => {
    console.log("is logged in was called", !!req.session.loggedIn)
    res.send({loggedIn : !!req.session.loggedIn})
}

module.exports.register = async (req, res) => {
    const {username, password} = req.body
    const errors = validationResult(req)

    var errMessage = ""
    errors.array().forEach(err => errMessage += err + " ")

    if(await Users.findOne({username}) !== null) {
        res.render("register", {
            password,
            username, 
            messages : [{msg : "This username has already been used by another user!"}]
        })
        console.log("auth/register: username has already been used by another user!")
        return
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
    await Users.create({
        username,
        password : hashedPassword
    })

    res.render("register", {
        messages : [{msg : "Register successfully, login now!"}]
    })
    console.log("auth/signup: success")
}

module.exports.login = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await Users.findOne({username})

        if(user == null || !bcrypt.compareSync(password, user.password)) {
            res.send({success : false, message : "Username or passwod is wrong"})
            console.log("auth/login: username or passwod is wrong")
            return                
        }
        
        req.session.loggedIn = true;
        console.log("auth/login: success")
        user.seasionID = req.sessionID
        await user.save()
        res.send({success : true, message : "Logic successfully"})
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}

module.exports.findUserBySeassion = async (req, res, next) => {
    try {
        const user = await Users.findOne({seasionID : req.sessionID})
        if(user !== null && user?.seasionID != "") {
            req.user = user
            //console.log(user)
            next()
        }
        else
            res.send({message : "you have not logged in yet"})
    } catch (err) {
        console.log(err)
    } 
}

module.exports.logout = async (req, res) => {
    try {
        const user = await Users.findOne({seasionID : req.sessionID})
        if(user !== null) {
            user.seasionID = ""
            await user.save()
            res.send({success : true, message : "logout successfully"})
        }
        else
            res.send({success : false, message : "you have not logged in yet"})
    } catch (err) {
        console.log(err)
    } 
}