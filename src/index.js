const {app} = require('./app')

app.listen(process.env.PORT, '192.168.100.107',() => {
    console.log('server is up')
})
