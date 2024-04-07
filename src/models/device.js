const mongoose = require('mongoose')

const fansSchema = new mongoose.Schema ({
    userId : String,
    name : String,
    state : {type : Boolean, default : false},
    level : {type : Number, default : 0, min : 0, max : 2} 
}, {timestamps:true})

fansSchema.virtual("type").get(function() {return "fan"})

module.exports.Fan = mongoose.model('fans', fansSchema)

const ledsSchema = new mongoose.Schema ({
    userId : String,
    name : String,
    state : {type : Boolean, default : false},
    time : Date
}, {timestamps:true})

ledsSchema.virtual("type").get(function() {return "led"})

module.exports.Led = mongoose.model('leds', ledsSchema)

const doorsSchema = new mongoose.Schema ({
    userId : String,
    name : String,
    state : {type : Boolean, default : false},
}, {timestamps:true})

doorsSchema.virtual("type").get(function() {return "door"})

module.exports.Door = mongoose.model('doors', doorsSchema)