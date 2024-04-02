const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: "B98DeTbKkg8XPIVnXlIGl49CVOM0YxApxyTBfS9qZ5bEEWPp5nVggUH1xjPlFgB0",
    clientId: "nodejs_server",
});

const {Led, Door, Fan} = require("../src/models/device")

const controlRequests = {count : 0,
                        cmds : []
};

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
            io.to(cmd.sessionId).emit(`res/${cmd.deviceId}/state`, {...cmd, success: false})
            console.log("cmd expired", cmd)  
        }
    })
    controlRequests.cmds = newCmd
}

setInterval(checkCmdDate, 200)

const mqttRouter = require('mqtt-simple-router')
const router = new mqttRouter()

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
    console.log(query)

    if(getParameter(query, "success=") == "true") {
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            console.log("detect setState")
            io.to(cmd.sessionId).emit(`res/${cmd.deviceId}/state`, {...cmd, success: true})
            console.log(cmd)
            const led = await Led.findById(cmd.deviceId)
            console.log(led)
            led.status = cmd.state
            await led.save()
            console.log(controlRequests)
        }    
    }
});

router.auto('esp32/door', async function(request) {
    console.log('esp32/door was called')
    const query = request.payload.toString()
    console.log(query)

    if(getParameter(query, "success=") == "true") {
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            console.log("detect setState")
            io.to(cmd.sessionId).emit(`res/${cmd.deviceId}/state`, {...cmd, success: true})
            console.log(cmd)
            const door = await Door.findById(cmd.deviceId)
            console.log(door)
            door.status = cmd.state
            await door.save()
            console.log(controlRequests)
        }    
    }
});

router.auto('esp32/fan', async function(request) {
    console.log('esp32/fan was called')
    const query = request.payload.toString()
    console.log(query)

    if(getParameter(query, "success=") == "true") {
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            console.log("detect setState")
            io.to(cmd.sessionId).emit(`res/${cmd.deviceId}/state`, {...cmd, success: true})
            console.log(cmd)
            const fan = await Fan.findById(cmd.deviceId)
            console.log(fan)
            fan.status = cmd.state
            await fan.save()
            console.log(controlRequests)
        } else if(cmd.cmd == "setLevel") {
            console.log("detect setLevel")
            io.to(cmd.sessionId).emit(`res/${cmd.deviceId}/level`, {...cmd, success: true})
            console.log(cmd)
            const fan = await Fan.findById(cmd.deviceId)
            console.log(fan)
            fan.level = cmd.level
            await fan.save()
            console.log(controlRequests)
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