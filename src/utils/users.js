const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            errorMessage: 'username and room are required!'
        }
    }

    const existingUser = users.find((user) => user.username == username && user.room == room);
    if (existingUser) {
        return {
            errorMessage: 'username already taken!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user };

}

const getUserIndexById = (id) => {
    return users.findIndex((user) => user.id == id);
}

const getUserById = (id) => {
    const index = getUserIndexById(id);
    if (index > -1) {
        return users[index];
    }
}

const getRoomUsersByRoomName = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room == room);
}

const removeUser = (id) => {
    const index = getUserIndexById(id);
    if (index > -1) {
        return users.splice(index, 1)[0];
    }
}

module.exports = {
    addUser,
    getUserById,
    getRoomUsersByRoomName,
    removeUser
}
