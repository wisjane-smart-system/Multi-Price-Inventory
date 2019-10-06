var express = require('express')
    , path = require('path')
    , csrf = require('csurf')
    , cookieParser = require('cookie-parser')
    , mysqli = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');

//for encryption
var bcrypt = require('bcrypt');

// setup route middlewares
var csrfProtection = csrf({ cookie: true });

// create express app
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
//set session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


//function to check authentication
function authChecker(req, res, next) {
  if (req.session.loggedin == true) {
      next();
  } else {
     req.flash('warning', 'You are not Authorized to view this page! Please Log in');
     res.redirect("/");
  }
}

//set flash messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//bodyparser middleware
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// we need this because "cookie" is true in csrfProtection
app.use(cookieParser());


//set views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//database connection
var connection = mysqli.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'multiprice'
  });
   
  //database connection
  connection.connect((function(err) {
    if (err) {
      console.log('Error While Connecting');
      return;
    }
   
    console.log('Connected..');
  }));

 //logout route
 app.get('/logout', csrfProtection, function (req, res ,next){
    req.session.loggedin = false;
    req.flash('danger', 'logout successfully');
    res.redirect('/');
    
 });

 //login route
app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
        connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
          if (results.length > 0) {
              bcrypt.compare(password, results[0].password, function(err, result){
                if(result==true){
                request.session.loggedin = true;
                request.session.username = username;
                request.flash('success','welcome '+ request.session.username);
                response.redirect('/dashboard');
                }
                else {
                  request.flash('danger','Incorrect Username and/or Password!');
                  response.redirect('/');
              } 
            })		
        }
        else{
          request.flash('warning', 'Details not Found! Please Contact your Admin for registration')
          response.redirect('/')
        }
      })
});

// //user reg
// app.get('/reg', function(req, res){
//   var userName = 'Tufail'
//   var userPass = '1234'
//   bcrypt.hash(userPass, 10, function(err, hash) {
//     connection.query('INSERT INTO users VALUES ("", "'+userName+'", "'+hash+'", "Tufail@1234")', function(err, results, fields){
//       res.send(results)
//     })
//     console.log(hash)
//   });
// });

//user-list 
app.get('/user-list',authChecker, csrfProtection, function(req, res){
  connection.query('SELECT *, (SELECT COUNT(*) FROM users) as total FROM users', function(error, results, fields) {
    res.render('user-list', {
      username: req.session.username,
      user_list: results,
      user: results[0].total
    });
});
});

//dashboard
app.get('/dashboard', authChecker, csrfProtection, function (req, res) { 
  connection.query('SELECT *, (SELECT COUNT(*) FROM users) as total FROM users', function(error, results, fields) {
    res.render('dashbord', {
      username: req.session.username,
      user: results[0].total
    });
    });
});

//products
app.get('/products', authChecker, csrfProtection, function (req, res) {
  connection.query('SELECT *, (SELECT COUNT(*) FROM users) as total FROM users', function(error, results, fields) {
    res.render('products', {
      username: req.session.username,
      user: results[0].total
    });
    });
  
});

  
//route index
app.get('/', csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.render('login',{ csrfToken: req.csrfToken() });
});

//app listening  to host with port
app.listen('5000', function(req, res){
    console.log('server is listening to port .....5000');
    
});