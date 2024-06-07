require('dotenv').config()
const e = require('cors');
const {socketSend} = require("../src/socket")
const {Led, Fan, Door} = require("./models/device")
const mqtt = require("mqtt");
const mqttRouter = require('mqtt-simple-router');
const router = new mqttRouter()
let client;

const mqttInit = async () => {
    client = mqtt.connect("mqtt://mqtt.flespi.io", {
       username: process.env.MQTT_USERNAME,
       clientId: "nodejs_server"
   });
   client.on("connect", () => {
        console.log("mqtt connected")
        router.wrap(client)
    })
}

/* messages = [{messageID : Number, resolve: function] */
const mqttMessageManager = {
    message_count: 0,
    messages: [],
    setResolve: (messageID, result) => {
        const index = mqttMessageManager.messages.findIndex((e) => e.messageID == messageID);
        if(index !== -1) {
            mqttMessageManager.messages[index].resolve(result);
            mqttMessageManager.messages.splice(index, 1);
        }
    }
};

const mqttPublishWithAck = async (topic, payload) => {
    const messageID = mqttMessageManager.message_count;
    mqttMessageManager.message_count++;
    client.publishAsync(topic, `messageID=${messageID}&${payload}`);

    return new Promise((resolve, rejects) => {
        mqttMessageManager.messages.push({
            messageID,
            resolve,
        });
        setTimeout(() => mqttMessageManager.setResolve(messageID, false), 10*1000);
    })
}

console.log("MQTT_USERNAME", process.env.MQTT_USERNAME)

const getParameter = (query, key) => {
    var index = query.indexOf(key)
    if(index !== -1) {
        index += key.length
        const lastIndex = query.indexOf("&", index);
        return query.substring(index, lastIndex !== -1 ? lastIndex : undefined)
    }
    return ""
}

router.auto('esp32/fan/sync', async function(request) {
    const query = request.payload.toString()
    console.log(`esp32/fan/sync was called`)

    console.log(query)
    const deviceId = getParameter(query, "id=")
    const fan = await Fan.findById(deviceId)
    const {state, level} = fan
    client.publishAsync(deviceId, `cmd=sync&state=${state}&level=${level}`)
});

router.auto('esp32/led/sync', async function(request) {
    const query = request.payload.toString()
    console.log(`esp32/led/sync was called`)

    console.log(query)
    const deviceId = getParameter(query, "id=")
    const led = await Led.findById(deviceId)
    const {state} = led
    client.publishAsync(deviceId, `cmd=sync&state=${state}`)
});

router.auto('esp32/door/sync', async function(request) {
    const query = request.payload.toString()
    console.log(`esp32/door/sync was called`)

    console.log(query)
    const deviceId = getParameter(query, "id=")
    const door = await Door.findById(deviceId)
    const {state} = door
    client.publishAsync(deviceId, `cmd=sync&state=${state}`)
});

router.auto('esp32/ack', async function(request) {
    const query = request.payload.toString();
    const messageID = parseInt(getParameter(query, "messageID="));
    mqttMessageManager.setResolve(messageID, true);
})

module.exports = { mqttInit, mqttPublishWithAck }