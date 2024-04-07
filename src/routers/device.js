const express = require('express')
const deviceRoute = express.Router()
const deviceController = require('../controller/device')

deviceRoute.get('/', deviceController.getDevices)
deviceRoute.post('/fan/create', deviceController.createFan)
deviceRoute.post('/led/create', deviceController.createLed)
deviceRoute.post('/door/create', deviceController.createDoor)
deviceRoute.post('/:type/state', deviceController.setState)
deviceRoute.post('/led/time', deviceController.setLedTime)
deviceRoute.post('/fan/level', deviceController.setFanLevel)
deviceRoute.post('/led/add', deviceController.addLed)

module.exports = deviceRoute