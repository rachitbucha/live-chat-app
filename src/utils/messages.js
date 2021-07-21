const generateMessageAndLocation = (userName, text) => {
    return {
        userName,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessageAndLocation
}