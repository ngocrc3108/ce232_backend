# Run server
install dependencies
```
npm install
```
start server
```
node main
```
expected log
```
MQTT_USERNAME ftEeUSBBaVIR7IjREV1ZCQ7PyL3bcHmuIysQbWwXOdJy6NZx8I8Kb6GAlJKqNh0T
mongodb is connected
find all leds
Server is listening on port 4001
[
  {
    schedule: { time: 2024-05-19T07:03:36.714Z, option: 'OFF' },
    _id: new ObjectId('6649a8168950f2c97e5cc8cd'),
    userId: '65f97183eb8ef517c781539a',
    state: 0,
    createdAt: 2024-05-19T07:19:50.985Z,
    updatedAt: 2024-05-21T04:34:26.122Z,
    __v: 0,
    type: 'led',
    id: '6649a8168950f2c97e5cc8cd'
  }
]
mqtt connected
```

# Read Leds data from db
```
  const { Led } = require("./src/models/device");
  let leds = await Led.find({}); // find all record
  leds = leds.map((e) => e.toObject({ virtuals: true }));
  console.log(leds);
```
[more](https://mongoosejs.com/docs/queries.html)