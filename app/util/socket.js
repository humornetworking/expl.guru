module.exports = function (app,io,jwt) {

    io.on('connection', function(socket) {


        socket.auth = false;
        socket.on('authenticate', function(data){

            var user = jwt.decode(data.token, app.get('superSecret'));
            app.get('connections')[user._id] = socket;
            socket.auth = true;

        });



    });

};
