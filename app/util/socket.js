module.exports = function (app,io) {

    io.on('connection', function(socket) {

        app.get('connections')[socket.id] = socket;
        //Como obtengo el jwt para obtener el user id ?

    });

};
