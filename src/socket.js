let io
let socketOption;

const socketInit = (server, middleware) => {
    if (process.env.NODE_ENV === "production") {
        socketOption = {
            cors: {
                origin : process.env.ORIGIN,
                credentials: true,
            },
        };
    console.log("socketOption", socketOption);
    }
    
    io = require("socket.io")(server, socketOption);
    io.engine.use(middleware);
    io.on("connection", function (socket) {
        socket.join(socket.request.session.id);
        console.log("socket connected");
    });
}

const socketSend = (id, eventName, data) => {
    io.to(id).emit(eventName, data)
}

module.exports = {socketInit, socketSend}