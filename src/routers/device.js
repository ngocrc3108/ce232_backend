const express = require('express')
const deviceRoute = express.Router()
const deviceController = require('../controller/device')

deviceRoute.get('/', deviceController.getDevices)
deviceRoute.post('/:type/create', deviceController.create)
deviceRoute.post('/:type/state', deviceController.setState)
deviceRoute.post('/:type/add', deviceController.add)
deviceRoute.post('/led/time', deviceController.setLedTime)
deviceRoute.post('/fan/level', deviceController.setFanLevel)

module.exports = deviceRoute