const rootSocket = (io) => {
    io.on('connection', (socket) => {
        require('./chat')(socket, io)
        console.log('coon')
        
        io.on('disconnect', () => {
            console.log('disconnected')
        })
    })
}

module.exports = rootSocket