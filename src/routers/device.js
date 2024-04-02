const express = require('express')
const deviceRoute = express.Router()
const deviceController = require('../controller/device')

deviceRoute.get('/', deviceController.getDevices)
deviceRoute.post('/fan/create', deviceController.createFan)
deviceRoute.post('/led/create', deviceController.createLed)
deviceRoute.post('/door/create', deviceController.createDoor)
deviceRoute.post('/fan/status', deviceController.setFanStatus)
deviceRoute.post('/led/status', deviceController.setLedStatus)
deviceRoute.post('/door/status', deviceController.setDoorStatus)
deviceRoute.post('/led/time', deviceController.setLedTime)
deviceRoute.post('/fan/level', deviceController.setFanLevel)
deviceRoute.post('/led/add', deviceController.addLed)

module.exports = deviceRoute