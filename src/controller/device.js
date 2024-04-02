const { body } = require('express-validator')
const {Fan, Led, Door} = require('../models/device')
const {client, controlRequests, pushCmd} = require('../mqtt')
const { ObjectId } = require('mongodb');

module.exports.createFan = async (req, res) => {
    const fan = await Fan.create({userId : req.user._id, name : req.body.name})
    console.log("create fan", fan)
    if(fan) 
        res.send({message : "create fan successfully"})
    else
        res.send({message : "create fan fail"})
}

module.exports.createLed = async (req, res) => {
    const led = await Led.create({userId : req.user._id, name : req.body.name})
    console.log("create led", led)
    if(led) 
        res.send({message : "create led successfully"})
    else
        res.send({message : "create led fail"})
}

module.exports.createDoor = async (req, res) => {
    const door = await Door.create({userId : req.user._id, name : req.body.name})
    console.log("create door", door)
    if(door) 
        res.send({message : "create door successfully"})
    else
        res.send({message : "create door fail"})
}

module.exports.getDevices = async (req, res) => {
    console.log(req.user)
    const userId =  req.user._id;

    var devices = await Promise.all([Fan.find({userId}),
        Led.find({userId}),
        Door.find({userId})
    ])

    devices = devices[0].concat(devices[1], devices[2])
    devices = devices.sort((a, b) => b.createdAt - a.createdAt)
    devices = devices.map((device) => device.toObject({ virtuals: true }))
    res.send(devices)
}

module.exports.setFanStatus = async (req, res) => {

    const {deviceId, status} = req.body
    console.log("set fan was call")

    const fan = await Fan.findOne({_id : deviceId, userId : req.user._id})
    if(fan !== null) {
        const requestId = pushCmd({
            sessionId : req.sessionID,
            deviceId,
            cmd : "setState",
            state : status
        })
        client.publishAsync(deviceId, `cmd=setState&requestId=${requestId}&state=${status ? "on" :"off"}`)
        console.log(controlRequests)
        res.send({message : "sent command successfully"})
        return
    }
    res.send({message : "device not found"})
}

module.exports.setLedStatus = async (req, res) => {

    const {deviceId, status} = req.body
    console.log("set led was call")

    const led = await Led.findOne({_id : deviceId, userId : req.user._id})
    if(led !== null) {
        const requestId = pushCmd({
            sessionId : req.sessionID,
            deviceId,
            cmd : "setState",
            state : status
        })
        client.publishAsync(deviceId, `cmd=setState&requestId=${requestId}&state=${status ? "on" :"off"}`)
        console.log(controlRequests)
        res.send({message : "sent command successfully"})
        return
    }
    res.send({message : "device not found"})
}

module.exports.setDoorStatus = async (req, res) => {
    const {deviceId, status} = req.body
    console.log("set led was call")

    const door = await Door.findOne({_id : deviceId, userId : req.user._id})
    if(door !== null) {
        const requestId = pushCmd({
            sessionId : req.sessionID,
            deviceId,
            cmd : "setState",
            state : status
        })
        client.publishAsync(deviceId, `cmd=setState&requestId=${requestId}&state=${status ? "on" :"off"}`)
        console.log(controlRequests)
        res.send({message : "sent command successfully"})
        return
    }
    res.send({message : "device not found"})
}

module.exports.setLedTime = async (req, res) => {
    const {deviceId, time} = req.body;
    const led = await Led.findOne({_id : deviceId, userId : req.user._id})
    if(led !== null) {
        led.time = time
        await led.save()
        res.send({message : "set led time successfully"})
        return
    }
    res.send({message : "device not found"})    
}

module.exports.setFanLevel = async (req, res) => {
    const {deviceId, level} = req.body
    console.log("set level was call")

    const fan = await Fan.findOne({_id : deviceId, userId : req.user._id})
    if(fan !== null) {
        const requestId = pushCmd({
            sessionId : req.sessionID,
            deviceId,
            cmd : "setLevel",
            level : level
        })
        client.publishAsync(deviceId, `cmd=setLevel&requestId=${requestId}&level=${level}`)
        console.log(controlRequests)
        res.send({message : "sent command successfully"})
        return
    }
    res.send({message : "device not found"})    
}

module.exports.addLed = async (req, res) => {
    const {id, name} = req.body
    try {
        const led = await Led.findById(new ObjectId(id))
        console.log(led)
        if(led === null) {
            res.send({success : false, message : "device id doesn't exist"})
            return
        }

        if(led.userId == "") {
            led.userId = req.user._id
            led.name = name
            res.send({success : true, message : "add device successfully", device : led})
            await led.save()
        } else 
            res.send({success : false, message : "device has already linked to another user"})

        return    
    } catch (err) {
        console.log(err)
        res.send({err})
    }
}