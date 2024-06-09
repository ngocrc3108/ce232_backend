const express = require('express')
const deviceRoute = express.Router()
const deviceController = require('../controller/device')

deviceRoute.post('/', deviceController.getDevices)
deviceRoute.post('/:type/state', deviceController.setState)
deviceRoute.post('/:type/add', deviceController.add)
deviceRoute.post('/led/schedule', deviceController.setSchedule)
deviceRoute.post('/fan/level', deviceController.setFanLevel)

module.exports = deviceRoute