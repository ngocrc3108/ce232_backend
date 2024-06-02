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
        socket.data.userId = "ngocrccccccccc";
        socket.join(socket.request.session.id);
        console.log("socket connected");
    });
}

const socketSend = (id, eventName, data) => {
    io.to(id).emit(eventName, data)
}

// setTimeout(async () => {
//     const sockets = await io.fetchSockets();
//     sockets.forEach(socket => {
//         console.log(socket.rooms);
//     });
// }, 20000);

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