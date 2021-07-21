const { generateMessageAndLocation } = require('./utils/messages');
const { addUser, getUserById, getRoomUsersByRoomName, removeUser } = require('./utils/users');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let message = 'Welcome!';

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const { errorMessage, user } = addUser({ id: socket.id, ...options });
        if (errorMessage) {
            return callback(errorMessage);
        }
        socket.join(user.room);
        socket.emit('message', generateMessageAndLocation(user.username, message));
        socket.broadcast.to(user.room).emit('message', generateMessageAndLocation(user.username, `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getRoomUsersByRoomName(user.room)
        });
        callback();
    });

    socket.on('SendMessage', (message, callback) => {
        const user = getUserById(socket.id);
        io.to(user.room).emit('message', generateMessageAndLocation(user.username, message));
        callback('Delivered');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessageAndLocation(user.username, `${user.username} has disconnected...`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getRoomUsersByRoomName(user.room)
            });
        }
    });

    socket.on('ShareLocation', (location, callback) => {
        const user = getUserById(socket.id)
        io.to(user.room).emit('location', generateMessageAndLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    });
});

server.listen(port, () => {
    console.log("Server Up and Running on Port", port);
});