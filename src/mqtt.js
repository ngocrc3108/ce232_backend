require('dotenv').config()
const e = require('cors');
const {socketSend} = require("../src/socket")
const {Led, Fan, Door} = require("./models/device")
const mqtt = require("mqtt");
const mqttRouter = require('mqtt-simple-router')

const router = new mqttRouter()
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: process.env.MQTT_USERNAME,
    clientId: "nodejs_server"
});
client.on("connect", () => {
    console.log("mqtt connected")
    router.wrap(client)
})
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

router.auto('esp32/:type', async function(request) {
    const { type } = request.params
    const query = request.payload.toString()
    console.log(`esp32/${type} was called`)

    console.log(query)
    if(getParameter(query, "success=") == "1") {
        console.log("here")
        const requestId = getParameter(query, "requestId=")
        const cmd = popCmd(requestId)
        console.log(cmd)
        if(cmd === undefined) 
            return

        if(cmd.cmd == "setState") {
            console.log("detect setState")
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/state`, {...cmd, success: true})
            let model;
            switch(type) {
                case "led": model = Led; break;
                case "fan": model = Fan; break;
                case "door": model = Door; break;
                default : return;
            }
            const device = await model.findById(cmd.deviceId)
            device.state = cmd.state
            await device.save()
        } else if(cmd.cmd == "setLevel") {
            console.log("detect setLevel")
            socketSend(cmd.sessionId, `res/${cmd.deviceId}/level`, {...cmd, success: true})
            const device = await Fan.findById(cmd.deviceId)
            device.level = cmd.level
            await device.save()       
        }
    }
});

module.exports = {pushCmd, controlRequests, client}