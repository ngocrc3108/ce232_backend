const mongoose = require('mongoose')

const fansSchema = new mongoose.Schema ({
    userId : {type : String, default : ""},
    name : {type : String, default : ""},
    state : {type : Number, default : 0},
    level : {type : Number, default : 0, min : 0, max : 2} 
}, {timestamps:true})

fansSchema.virtual("type").get(function() {return "fan"})

module.exports.Fan = mongoose.model('fans', fansSchema)

const ledsSchema = new mongoose.Schema ({
    userId : {type : String, default : ""},
    name : {type : String, default : ""},
    state : {type : Number, default : 0},
    schedule : {
        time : {type : Date, default : new Date(2024, 0, 1, 0, 0, 0, 0)},
        option : {type : String, default : "NONE"},
    },
}, {timestamps:true})

ledsSchema.virtual("type").get(function() {return "led"})

module.exports.Led = mongoose.model('leds', ledsSchema)

const doorsSchema = new mongoose.Schema ({
    userId : {type : String, default : ""},
    name : {type : String, default : ""},
    state : {type : Number, default : 0},
}, {timestamps:true})

doorsSchema.virtual("type").get(function() {return "door"})

module.exports.Door = mongoose.model('doors', doorsSchema)