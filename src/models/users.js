const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema ({
    username : String,
    password : String,
    seasionID : {
        type : String,
        default : ""
    }
}, {timestamps:true})

const usersModel = mongoose.model('users', usersSchema)

module.exports = usersModel