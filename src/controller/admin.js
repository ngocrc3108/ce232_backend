const { Fan, Led, Door } = require('../models/device')
const { addJob } = require('../ledScheduler');

module.exports.create = async (req, res) => {
    const { type } = req.params;
    let Model;
    switch(type) {
        case "led": Model = Led; break;
        case "fan": Model = Fan; break;
        case "door": Model = Door; break;
        default : return;
    }

    const device = await Model.create({name: req.body.name});
    console.log(`create ${type}`, device);
    if(device) 
        res.send({
            message : `create ${type} successfully`,
            device
        });
    else
        res.send({message : `create ${type} fail`});

    if(type == "led")
        addJob(device);
};