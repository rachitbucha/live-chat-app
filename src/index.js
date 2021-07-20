const { generateMessageAndLocation } = require('./utils/messages');
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

    socket.on('join', ({ username, room }) => {
        socket.join(room);
        socket.emit('message', generateMessageAndLocation(message));
        socket.broadcast.to(room).emit('message', generateMessageAndLocation(`${username} has joined!`));
    });

    socket.on('SendMessage', (message, callback) => {
        io.emit('message', generateMessageAndLocation(message));
        callback('Delivered');
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessageAndLocation('A User Has disconnected...'))
    });

    socket.on('ShareLocation', (location, callback) => {
        io.emit('location', generateMessageAndLocation(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    });
});

server.listen(port, () => {
    console.log("Server Up and Running on Port", port);
});