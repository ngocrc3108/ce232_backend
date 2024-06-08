const { Fan, Led, Door } = require('../models/device')
const { mqttPublishWithAck } = require('../mqtt')
const { ObjectId } = require('mongodb');
const { modifyJob } = require('../ledScheduler');

module.exports.getDevices = async (req, res) => {
    console.log("get device was called")
    const userId =  req.user._id;

    var devices = await Promise.all([
        Fan.find({userId}),
        Led.find({userId}),
        Door.find({userId})
    ])

    devices = devices[0].concat(devices[1], devices[2])
    devices = devices.sort((a, b) => b.createdAt - a.createdAt)
    devices = devices.map((device) => device.toObject({ virtuals: true }))
    res.send(devices)
}

module.exports.create = async (req, res) => {
    const { type } = req.params
    let Model;
    switch(type) {
        case "led": Model = Led; break;
        case "fan": Model = Fan; break;
        case "door": Model = Door; break;
        default : return;
    }

    const device = await Model.create({userId : req.user._id, name : req.body.name})
    console.log(`create ${type}`, device)
    if(device) 
        res.send({message : `create ${type} successfully`})
    else
        res.send({message : `create ${type} fail`})
}

module.exports.setState = async (req, res) => {
    const {state, deviceId } = req.body
    const { type } = req.params
    console.log(`set state for ${type}, id: ${deviceId}`)
    let Model;
    switch(type) {
        case "led": Model = Led; break;
        case "fan": Model = Fan; break;
        case "door": Model = Door; break;
        default : return;
    }

    const device = await Model.findById(deviceId)
    if(device != null) {
        const success = await mqttPublishWithAck(deviceId, `cmd=setState&state=${state ? "1" :"0"}`)
        console.log("success", success);
        res.send({ success })

        if(success) {
            device.state = state
            device.save()
        }

        return
    }

    res.send({ success: false })
}

module.exports.setSchedule = async (req, res) => {
    var {deviceId, schedule} = req.body;
    schedule.time = new Date(schedule.time);
    const led = await Led.findOne({_id : deviceId, userId : req.user._id})
    if(led !== null) {
        modifyJob({id: deviceId, schedule});
        led.schedule = schedule
        await led.save()
        res.send({message : "set led schedule successfully"})
        return
    }
    res.send({message : "device not found"})    
}

module.exports.setFanLevel = async (req, res) => {
    const {deviceId, level} = req.body
    console.log("set level was call")

    const fan = await Fan.findOne({_id : deviceId, userId : req.user._id})
    if(fan != null) {
        const success = await mqttPublishWithAck(deviceId, `cmd=setLevel&level=${level}`)
        res.send({ success })
        console.log("fan level, success", success);

        if(success) {
            fan.level = level
            fan.save()
        }

        return
    }

    res.send({ success: false })
}

module.exports.add = async (req, res) => {
    const {id, name} = req.body
    const { type } = req.params
    let Model;
    switch(type) {
        case "led": Model = Led; break;
        case "fan": Model = Fan; break;
        case "door": Model = Door; break;
        default : return;
    }
    try {
        const device = await Model.findById(new ObjectId(id))
        console.log(device)
        if(device === null) {
            const message = `${type} id doesn't exist`
            console.log(message)
            res.send({success : false, message})
            return
        }

        if(device.userId == "") {
            device.userId = req.user._id
            device.name = name
            const message = `add ${type} successfully`
            console.log(message)
            res.send({success : true, message, device : device})
            await device.save()
        } else {
            const message = `${type} has already linked to another user`
            console.log(message)
            res.send({success : false, message})
        }

        return    
    } catch (err) {
        console.log(err)
        res.send({err})
    }
}