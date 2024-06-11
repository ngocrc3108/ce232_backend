const Users = require('../models/users')
const bcrypt = require('bcrypt')
const {validationResult} = require("express-validator")

module.exports.register = async (req, res) => {
    const {username, password} = req.body
    const validateResult = validationResult(req)

    var messages = []
    if(!validateResult.isEmpty()) {
        messages = validateResult.array().map(err => err.msg)
        console.log(messages)
        res.send({success : false, messages})
        return
    }

    if(await Users.findOne({username}) !== null) {
        res.send({
            success: false,
            messages: ["This username has already been used by another user!"],
        })
        console.log("auth/register: username has already been used by another user!")
        return
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
    await Users.create({
        username,
        password : hashedPassword
    })

    res.send({ success: true, messages: ["Register successfully, login now!"] });
    console.log("auth/signup: success")
}

module.exports.login = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await Users.findOne({username})

        if(user == null || !bcrypt.compareSync(password, user.password)) {
            res.send({success : false, message : "Username or passwod is wrong"})
            console.log("auth/login: username or password is wrong")
            return                
        }
        
        req.session.userId = user._id
        console.log("auth/login: success")
        res.send({success : true, message : "Logic successfully"})

    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}

module.exports.findUserBySession = async (req, res, next) => {
    try {
        if(req.session.userId !== undefined) {
            const user = await Users.findById(req.session.userId)
            if(user !== null) {
                req.user = user
                next()
                return
            }
            res.status(409).send({message: "invalid session"}) // conflict status
        }
        else
            res.status(401).send({message : "you have not logged in yet"})
    } catch (err) {
        console.log(err)
    }
}

module.exports.logout = async (req, res) => {
    try {
        req.session.userId = undefined
        res.send({success : true, message : "logout successfully"})
    } catch (err) {
        console.log(err)
    }
}