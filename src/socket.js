let io

const socketInit = (server, middleware) => {
    
    io = require("socket.io")(server);
    io.engine.use(middleware);
    io.on("connection", function (socket) {
        socket.join(socket.request.session.id);
        console.log("socket connected");
    });
}

const socketSend = (id, eventName, data) => {
    io.to(id).emit(eventName, data)
}

const joinByUserId = async (sessionId, userId) => {
    const sockets = await io.fetchSockets();
    sockets.forEach(socket => {
        if(socket.rooms.has(sessionId) && !socket.rooms.has(userId)) {
            console.log("join socket by userId");
            socket.join(userId);
        }
    });
}

module.exports = { socketInit, socketSend, joinByUserId }