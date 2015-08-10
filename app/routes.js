var Todo = require('./models/todo');
var Question = require('./models/question');
var Answer = require('./models/answer');
var User = require('./models/user');


function getTodos(res) {
    Todo.find(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(todos); // return all todos in JSON format
    });
};

module.exports = function (app, jwt, mailgun) {

    app.get('/api/questions', ensureAuthorized, function (req, res) {

        Question.find(function (err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
    });


    app.get('/api/questions/getByText/:pattern', ensureAuthorized, function (req, res) {

        Question.find(
            {
                "Title": {"$regex": req.params.pattern}
            }, function (err, questions) {

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)

                res.json(questions); // return all todos in JSON format
            });
    });


    app.get('/api/topQuestions', function (req, res) {


        Question.find({Date: {$lt: new Date()}}).limit(5).exec(function (err, question) {
            if (err)
                res.send(err);

            res.json(question);

        });


    });

    app.get('/api/questions/:question_id', function (req, res) {
        Question.find({
            _id: req.params.question_id
        }, function (err, question) {
            if (err)
                res.send(err);

            res.json(question);

        });
    });

    app.get('/api/answers/:answer_id', function (req, res) {
        Answer.find({
            _id: req.params.answer_id
        }, function (err, answer) {
            if (err)
                res.send(err);

            res.json(answer);

        });
    });

    app.post('/api/answers', ensureAuthorized, function (req, res) {

        // create a question, information comes from AJAX request from Angular
        var bearerToken;
        var bearerHeader = req.headers["authorization"]; //Porque no recivo el token ! Non - bloking thinking
        //var bearerHeader =  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiRmFjZWJvb2siLCJlbWFpbCI6ImNhcGl0YW5jYWJlcm5pY29sYUBob3RtYWlsLmNvbSIsIm5hbWUiOiJBbmRyw6lzIFbDoXNxdWV6IiwiX2lkIjoiNTVjODY5ZDFlZjcxMGU5NTVmZGZlOWRiIn0.tMfV3JZNsbQyy8CIZ2HKVfSWbfAIFrIWvVYcnAC0cOk";
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];

            User.findOne({"token": bearerToken}, function (err, user) {
                if (err)
                    res.send(err);
                else {

                    Answer.create(
                        {
                            Question: {
                                _id: req.body.Question._id,
                                Title: req.body.Question.Title,
                                Subject: req.body.Question.Subject
                            },
                            Answer: req.body.Answer,
                            User: {
                                Name: user.name,
                                Email: user.email,
                                Type: user.type,
                                Token: user.token

                            }
                        }


                        , function (err, todo) {
                            if (err) {
                                res.send(err);
                            } else {


                                //Aqui envio el correo


                                var data = {
                                    from: 'postmaster@sandbox2576ebf851d144449cdb3023f5b14267.mailgun.org',
                                    to: user.email,
                                    subject: 'Ha LLegado una respuesta a tu pregunta',
                                    text: 'Respuesta :'+ req.body.Answer
                                };

                                mailgun.messages().send(data, function (error, body) {
                                    console.log(body);
                                });

                                res.send(req.body.Answer);
                            }
                        });
                }

            });


        }
        ;

    });

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function (req, res) {

        // use mongoose to get all todos in the database
        getTodos(res);
    });


    app.post('/api/questions', ensureAuthorized, function (req, res) {

        // create a question, information comes from AJAX request from Angular
        var bearerToken;
        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];

            User.findOne({"token": bearerToken}, function (err, user) {
                if (err)
                    res.send(err);
                else {



                    Question.create({
                        Title: req.body.Title,
                        Subject: req.body.Subject,
                        User: {
                            Name: user.name,
                            Email: user.email,
                            Type: user.type,
                            Token: user.token

                        }
                    }, function (err, todo) {
                        if (err) {
                            res.send(err);
                        } else {

                            res.send(req.body.Title);
                        }
                    });
                }

            });


        }
        ;

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {
        Todo.remove({
            _id: req.params.todo_id
        }, function (err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });
    });


    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    app.post('/signin', function (req, res) {
        User.findOne({name: req.body.name, type: req.body.type}, function (err, user) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user) {
                    res.json({
                        type: false,
                        data: user,
                        token: user.token
                    });
                } else {

                    var userModel = new User();
                    userModel.name = req.body.name;
                    userModel.email = req.body.email;
                    userModel.type = req.body.type;

                    var token = jwt.sign(userModel, app.get('superSecret'), {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    //TODO : Aqui yo primero deberia eliminar el usuario by name and tipo de autenticacion

                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        type: req.body.type,
                        token: token
                    }, function (err, user) {
                        if (err)
                            res.send(err);
                        else
                            res.json({
                                name: user.name,
                                email: user.email,
                                type: user.type,
                                token: user.token

                            });
                    });
                }
            }
        });
    });


    function ensureAuthorized(req, res, next) {
        var bearerToken;
        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];

            // verifies secret and checks exp
            jwt.verify(bearerToken, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    //return res.json({ success: false, message: 'Failed to authenticate token.' });
                    res.send(403);
                } else {
                    // if everything is good, save to request for use in other routes
                    req.token = bearerToken;
                    next();
                }
            });


        } else {
            res.send(403);
        }
    }

    process.on('uncaughtException', function (err) {
        console.log(err);
    });


};