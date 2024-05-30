const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

const mongoOnOpen = (callback) => {
    mongoose.connection
    .on("open", () => {
        console.log("mongodb is connected");
        callback();
    })
    .on("close", () => console.log("mongodb is closed"))
    .on("error", (error) => {
        console.log(error);
        process.exit();
    });
}

const clientPromise = mongoose
    .connect(process.env.DATABASE_URL)
    .then(m => m.connection.getClient());

const mongoStore = MongoStore.create({ clientPromise });

module.exports = { mongoStore, mongoOnOpen };