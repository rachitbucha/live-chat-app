const generateMessageAndLocation = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessageAndLocation
}