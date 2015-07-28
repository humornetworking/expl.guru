var Todo = require('./models/todo');
var Question = require('./models/question');
var Answer = require('./models/answer');
var User = require('./models/user');


function getTodos(res){
	Todo.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(todos); // return all todos in JSON format
		});
};

module.exports = function(app,jwt) {

	app.get('/api/questions', function(req, res) {

		Question.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(todos); // return all todos in JSON format
		});
	});


	app.get('/api/questions/getByText/:pattern', function(req, res) {

		Question.find(
			{"Title": { "$regex": req.params.pattern}
			},function(err, questions) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(questions); // return all todos in JSON format
		});
	});


	app.get('/api/topQuestions', function(req, res) {


		Question.find({Date : {$lt: new Date()}}).limit(5).exec(function(err, question) {
			if (err)
				res.send(err);

			res.json(question);

		});



	});

	app.get('/api/questions/:question_id', function(req, res) {
		Question.find({
			_id :  req.params.question_id
		}, function(err, question) {
			if (err)
				res.send(err);

			res.json(question);

		});
	});

	app.get('/api/answers/:answer_id', function(req, res) {
		Answer.find({
			_id :  req.params.answer_id
		}, function(err, answer) {
			if (err)
				res.send(err);

			res.json(answer);

		});
	});

	app.post('/api/answers', function(req, res) {

		// create a question, information comes from AJAX request from Angular
		Answer.create(
		{
			Question : {_id : req.body.Question._id,
				Title : req.body.Question.Title,
				Subject : req.body.Question.Subject} ,
			Answer : req.body.Answer
		}


			, function(err, todo) {
			if (err)
				res.send(err);
			else
				res.send(req.body.Answer);
		});

	});

	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/todos', function(req, res) {

		// use mongoose to get all todos in the database
		getTodos(res);
	});


	app.post('/api/questions', function(req, res) {

		// create a question, information comes from AJAX request from Angular
		Question.create({
			Title : req.body.Title,
			Subject : req.body.Subject
		}, function(err, todo) {
			if (err)
				res.send(err);
            else
				res.send(req.body.Title);
		});

	});

	// delete a todo
	app.delete('/api/todos/:todo_id', function(req, res) {
		Todo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			getTodos(res);
		});
	});


	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

	app.post('/signin', function(req, res) {
		User.findOne({name: req.body.name, type: req.body.type}, function(err, user) {
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
					//var userModel = new User();
					var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
					User.create({
						name : req.body.name,
						type : req.body.type,
						token : token
					}, function(err, user) {
						if (err)
							res.send(err);
						else
							res.json({
								name: user.name,
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
			req.token = bearerToken;
			next();
		} else {
			res.send(403);
		}
	}

	process.on('uncaughtException', function(err) {
		console.log(err);
	});



};