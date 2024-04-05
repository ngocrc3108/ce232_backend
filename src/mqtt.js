require('dotenv').config()
let {socketSend} = require("../src/socket")

const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: process.env.MQTT_USERNAME,
    clientId: "nodejs_server"
});
const mqttRouter = require('mqtt-simple-router')
const router = new mqttRouter()
const {Led, Door, Fan} = require("../src/models/device")

const controlRequests = {count : 0,
                        cmds : []
};

console.log("MQTT_USERNAME", process.env.MQTT_USERNAME)

const pushCmd = (object) => {
    controlRequests.cmds.push({...object,
    id : controlRequests.count,
    time : new Date()
    })
    return controlRequests.count++ // id
}

const popCmd = (id) => {
    let cmd = undefined
    const cmdIndex = controlRequests.cmds.findIndex(cmd => cmd.id == id) //cmd.id is a number
    if(cmdIndex !== -1) {
        cmd = controlRequests.cmds[cmdIndex]
        controlRequests.cmds.splice(cmdIndex, 1);
    }
    return cmd
}

const checkCmdDate = () => {
    const newCmd = []
    const time = (new Date()).getTime()
    controlRequests.cmds.forEach(cmd => {
        if(time - cmd.time.getTime() < 10000)
            newCmd.push(cmd)
        else {
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/state`, {...cmd, success: false})
        }
    })
    controlRequests.cmds = newCmd
}

setInterval(checkCmdDate, 200)

const getParameter = (query, key) => {
    var index = query.indexOf(key)
    if(index !== -1) {
        index += key.length
        const lastIndex = query.indexOf("&", index);
        return query.substring(index, lastIndex !== -1 ? lastIndex : undefined)
    }
    return ""
}

// middleware to convert JSON to object
// router.auto('esp32/#', function(request, next) {
//     request.payload = JSON.parse(request.payload)

//     const {deviceId, status} = request.payload
//     console.log(deviceId)

//     // find obj in DB  using deviceId

//     next()
// });

router.auto('esp32/led', async function(request) {
    console.log('esp32/led was called')
    const query = request.payload.toString()

    if(getParameter(query, "success=") == "true") {
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            console.log("detect setState")
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/state`, {...cmd, success: true})
            const led = await Led.findById(cmd.deviceId)
            led.status = cmd.state
            await led.save()
        }    
    }
});

router.auto('esp32/door', async function(request) {
    console.log('esp32/door was called')
    const query = request.payload.toString()

    if(getParameter(query, "success=") == "true") {
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            console.log("detect setState")
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/state`, {...cmd, success: true})
            const door = await Door.findById(cmd.deviceId)
            door.status = cmd.state
            await door.save()
        }    
    }
});

router.auto('esp32/fan', async function(request) {
    console.log('esp32/fan was called')
    const query = request.payload.toString()

    if(getParameter(query, "success=") == "true") {
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/state`, {...cmd, success: true})
            const fan = await Fan.findById(cmd.deviceId)
            fan.status = cmd.state
            await fan.save()
        } else if(cmd.cmd == "setLevel") {
            console.log("detect setLevel")
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/level`, {...cmd, success: true})
            const fan = await Fan.findById(cmd.deviceId)
            fan.level = cmd.level
            await fan.save()
        }
    }
});

const mqttRouteInit = () => {
    client.on("connect", () => {
        console.log("mqtt connected")
        router.wrap(client)
    })
    return client
}

module.exports = {mqttRouteInit, pushCmd, controlRequests, client}