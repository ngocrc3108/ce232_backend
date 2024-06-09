let io

const socketInit = (server, middleware) => {
    io = require("socket.io")(server);
    io.engine.use(middleware);
    io.on("connection", function (socket) {
        const { userId } = socket.request.session;
        if(userId !== undefined) {
            console.log(`socket connected, userId: ${userId}`);
            socket.join(userId);
        }
        else {
            console.log(`socket denied`);
            socket.disconnect(true);
        }
    });
}

const socketSend = (id, eventName, data) => {
    io.to(id).emit(eventName, data)
}

module.exports = { socketInit, socketSend }