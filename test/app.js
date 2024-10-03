var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');

global.dbHandel = require('./database/dbHandel');
global.db = mongoose.connect("mongodb://localhost:27017/nodedb");
var app = express();
app.use(session({ 
	secret: 'secret',
	cookie:{ 
		maxAge: 1000*60*30 // Duração da sessão: 30 minutos
	}
}));

// Configuração do motor de visualização
app.set('views', path.join(__dirname, 'views'));
app.engine("html",require("ejs").__express); // ou app.engine("html",require("ejs").renderFile);
//app.set("view engine","ejs");
app.set('view engine', 'html');

// descomente após colocar seu favicon em /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){ 
	res.locals.user = req.session.user;
	var err = req.session.error;
	delete req.session.error;
	res.locals.message = "";
	if(err){ 
		res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
	}
	next();
});

app.use('/', routes);  // Configura a rota para o caminho /
app.use('/users', users); // Configura a rota para o caminho /users
app.use('/login', routes); // Configura a rota para o caminho /login
app.use('/register', routes); // Configura a rota para o caminho /register
app.use('/home', routes); // Configura a rota para o caminho /home
app.use("/logout", routes); // Configura a rota para o caminho /logout

// captura 404 e encaminha para o manipulador de erro
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// manipuladores de erro

// manipulador de erro no desenvolvimento
// irá imprimir o stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// manipulador de erro em produção
// nenhum stacktrace é vazado para o usuário
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
