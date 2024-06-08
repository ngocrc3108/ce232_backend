require('dotenv').config()
const {Led, Fan, Door} = require("./models/device")
const mqtt = require("mqtt");
const mqttRouter = require('mqtt-simple-router');
const router = new mqttRouter()
let client;

const mqttInit = async () => {
    client = mqtt.connect("mqtt://mqtt.flespi.io", {
       username: process.env.MQTT_USERNAME,
       clientId: `nodejs_${process.env.NODE_ENV}_${(new Date()).getTime()}`
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
    client.publish(topic, `messageID=${messageID}&${payload}`, {qos: 2}, (err) => console.log("qos", err));

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

async function syncFan(request) {
    const query = request.payload.toString()
    console.log(`esp32/fan/sync was called`)

    console.log(query)
    const deviceId = getParameter(query, "id=")
    const fan = await Fan.findById(deviceId)
    const {state, level} = fan
    client.publishAsync(deviceId, `cmd=sync&state=${state}&level=${level}`)
}

async function syncLed(request) {
    const query = request.payload.toString()
    console.log(`esp32/led/sync was called`)

    console.log(query)
    const deviceId = getParameter(query, "id=")
    const led = await Led.findById(deviceId)
    const {state} = led
    client.publishAsync(deviceId, `cmd=sync&state=${state}`)
}

async function syncDoor(request) {
    const query = request.payload.toString()
    console.log(`esp32/door/sync was called`)

    console.log(query)
    const deviceId = getParameter(query, "id=")
    const door = await Door.findById(deviceId)
    const {state} = door
    client.publishAsync(deviceId, `cmd=sync&state=${state}`)
}

async function HandleACK(request) {
    const query = request.payload.toString();
    const messageID = parseInt(getParameter(query, "messageID="));
    mqttMessageManager.setResolve(messageID, true);
}

router.auto('esp32/fan/sync', syncFan);
router.auto('esp32/led/sync', syncLed);
router.auto('esp32/door/sync', syncDoor);
router.auto('esp32/ack', HandleACK);

module.exports = { mqttInit, mqttPublishWithAck }