const { CronJob, CronTime } = require('cron'); // https://www.npmjs.com/package/cron
const { mqttPublishWithAck } = require('./mqtt');
const { Led } = require('./models/device');
const { socketSend } = require('./socket');

let jobs;

async function onTick() {
    console.log('do something with this', this);
    const state = this.schedule.option == "OFF" ? 0 : this.schedule.option == "ON" ? 1 : undefined;
    if(state !== undefined) {
        const success = await mqttPublishWithAck(this.id, `cmd=setState&state=${state}`)
        if(success) {
            const led = await Led.findById(this.id);
            socketSend(led.userId, `sync/${this.id}/state`, {newState: state});
            led.state = state;
            led.save();
        }
        else
            console.log("can not send schedule led to esp");
    }
}

const convertDateToCron = (date) => {
    return `0 ${date.getMinutes()} ${date.getHours()} * * *`
}

// tạo job cho tất cả led đang có trên database.
const ledSchedulerInit = async () => {
    const { Led } = require("./models/device");
    let leds = await Led.find({}, 'schedule'); // find all record, select only schedule and id.
    leds = leds.map((e) => e.toObject({virtuals: true }));

    jobs = leds.map(led => {
        console.log(led.schedule.time.toLocaleString());
        return CronJob.from({
            cronTime: convertDateToCron(led.schedule.time),
            onTick,
            start: true,
            context: led,
        });
    });
}

//  Hàm dùng để thay đổi thời gian và option khi người dùng thay đổi trên web.
const modifyJob = (led) => {
    console.log("modify job");
    const index = jobs.findIndex(job => job.context.id == led.id);
    if(index === -1) {
        console.log("can not modify job");
        return;
    }

    jobs[index].context = led;
    jobs[index].setTime(new CronTime(convertDateToCron(led.schedule.time)));
}

// Dùng để thêm job khi người dùng tạo mới một led.
const addJob = (led) => {
    console.log("add job");
    const index = jobs.findIndex(job => job.context.id == led.id);
    if(index !== -1) {
        console.log("job for this led has already existed");
        return;
    }

    const job = CronJob.from({
        cronTime: convertDateToCron(led.schedule.time),
        onTick: onTick,
        start: true,
        context: led,
    });
    jobs.push(job); // push job vừa tạo vào mảng để quản lí (modify).
}

module.exports = { ledSchedulerInit, addJob, modifyJob };