# Run server
install dependencies
```
npm install
```
start server
```
node main
```
start server on dev mode (auto restart when edit file).
```
npm run dev
```
expected log
```
MQTT_USERNAME ftEeUSBBaVIR7IjREV1ZCQ7PyL3bcHmuIysQbWwXOdJy6NZx8I8Kb6GAlJKqNh0T
The goose is open
Server is listening on port 4001
mqtt connected
```

# Read Leds data from db
```
const { Led } = require("./models/device");
const myFunction = async () => {
    const leds = await Led.find({}); // find all record
    console.log(leds);
}
myFunction(); // normal function call
```
[more](https://mongoosejs.com/docs/queries.html)