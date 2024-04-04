const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

mongoose.connection
    .on("open", () => console.log("The goose is open"))
    .on("close", () => console.log("The goose is closed"))
    .on("error", (error) => {
        console.log(error);
        process.exit();
    });

const clientPromise = mongoose
    .connect(process.env.DATABASE_URL)
    .then(m => m.connection.getClient());

const mongoStore = MongoStore.create({ clientPromise });

module.exports = { mongoStore };