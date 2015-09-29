var Question = require('./models/question');
var Answer = require('./models/answer');
var User = require('./models/user');





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
                                Question.findOne(
                                    {
                                        "_id": req.body.Question._id
                                    }, function (err, question) {

                                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                                        if (err) {
                                            res.send(err)
                                        } else {
                                            var data = {
                                                from: 'postmaster@sandbox2576ebf851d144449cdb3023f5b14267.mailgun.org',
                                                to: question.User.Email,
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

            });


        };

    });


    app.post('/api/questions', ensureAuthorized, function (req, res) {

        var user = getUserFromToken(req);

        if (user != null) {

            Question.create({
                Title: req.body.Title,
                Subject: req.body.Subject,
                User: {
                    _id : user._id,
                    Name: user.name,
                    Email: user.email
                }
            }, function (err, todo) {
                if (err) {
                    res.send(err);
                } else {

                    res.send(req.body.Title);
                }
            });

        };

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



                    //TODO : Aqui yo primero deberia eliminar el usuario by name and tipo de autenticacion

                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        type: req.body.type

                    }, function (err, user) {
                        if (err) {
                            res.send(err);
                        } else {

                            var token = jwt.sign(user, app.get('superSecret'), {
                                expiresInMinutes: 1440 // expires in 24 hours
                            });

                            //Actualizo el token
                            User.update({_id: user.id}, {
                                token: token
                            }, function(err, affected, resp) {
                                console.log(resp);
                            })

                            res.json({
                                name: user.name,
                                email: user.email,
                                type: user.type,
                                token: token

                            });
                        }
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

    function getUserFromToken(req) {

        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            var bearerToken = bearer[1];

            var user = jwt.decode(bearerToken, app.get('superSecret'));
            return user;
        } else {
            return null;
        }

    }

    process.on('uncaughtException', function (err) {
        console.log(err);
    });


};