var express = require('express');
var router = express.Router();

/* GET página inicial. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });    // Ao acessar este caminho, renderiza o arquivo index e envia o valor title para ser usado em index.html
});

/* GET página de login. */
router.route("/login").get(function(req, res) {    // Ao acessar este caminho, renderiza o arquivo login e envia o valor title para ser usado em login.html
  res.render("login", { title: 'Login de Usuário' });
}).post(function(req, res) { 					   // Detecta uma requisição POST neste caminho e executa a operação de tratamento de dados
  // Pegar informações do usuário
  // Aqui, o objeto User é obtido a partir do modelo por meio do método global dbHandel (implementado em app.js)
  var User = global.dbHandel.getModel('user');
  var uname = req.body.uname;				// Obtém o valor de 'uname' dos dados enviados via POST
  User.findOne({ name: uname }, function(err, doc) {   // Utiliza o model para buscar no banco de dados informações que correspondam ao nome de usuário
    if (err) { 										// Em caso de erro, retorna um erro 500 ao local de origem da requisição POST (login.html)
      res.send(500);
      console.log(err);
    } else if (!doc) { 								// Se não encontrar correspondência de nome de usuário, significa que o nome não existe
      req.session.error = 'Nome de usuário não encontrado';
      res.send(404);								// Retorna o código de status 404
    } else {
      if (req.body.upwd != doc.password) { 	// Encontrou correspondência de nome de usuário, mas a senha está incorreta
        req.session.error = "Senha incorreta";
        res.send(404);
      } else { 									// As informações correspondem, então o objeto (usuário encontrado) é atribuído à session.user e retorna sucesso
        req.session.user = doc;
        res.send(200);
      }
    }
  });
});

/* GET página de registro. */
router.route("/register").get(function(req, res) {    // Ao acessar este caminho, renderiza o arquivo register e envia o valor title para ser usado em register.html
  res.render("register", { title: 'Registro de Usuário' });
}).post(function(req, res) {
  // Aqui, o objeto User é obtido a partir do modelo por meio do método global dbHandel (implementado em app.js)
  var User = global.dbHandel.getModel('user');
  var uname = req.body.uname;
  var upwd = req.body.upwd;
  User.findOne({ name: uname }, function(err, doc) {   // Similar ao tratamento de /login
    if (err) {
      res.send(500);
      req.session.error = 'Erro de rede!';
      console.log(err);
    } else if (doc) {
      req.session.error = 'Nome de usuário já existe!';
      res.send(500);
    } else {
      User.create({ 							// Cria um objeto user e o insere no model
        name: uname,
        password: upwd
      }, function(err, doc) {
        if (err) {
          res.send(500);
          console.log(err);
        } else {
          req.session.error = 'Nome de usuário criado com sucesso!';
          res.send(200);
        }
      });
    }
  });
});

/* GET página inicial (home). */
router.get("/home", function(req, res) {
  if (!req.session.user) { 					// Ao acessar /home, verifica primeiro se o usuário está logado
    req.session.error = "Por favor, faça login primeiro";
    res.redirect("/login");					// Se não estiver logado, redireciona para /login
  }
  res.render("home", { title: 'Home' });         // Se estiver logado, renderiza a página home
});

/* GET página de logout. */
router.get("/logout", function(req, res) {    // Ao acessar /logout, faz logout, limpa os objetos user e error da sessão e redireciona para a raiz
  req.session.user = null;
  req.session.error = null;
  res.redirect("/");
});

module.exports = router;
