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
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                request.flash('success','welcome '+ request.session.username);
                response.redirect('/dashboard');
                
            } else {
                request.flash('danger','Incorrect Username and/or Password!');
                response.redirect('/');
            }			
            response.end();
        });
    } else {
        request.flash('info','Please Enter your Details');
        response.redirect('/');
    }
 
});

//user reg
app.get('/reg', function(req, res){
  
});

//user-list 
app.get('/user-list',authChecker, csrfProtection, function(req, res){
  connection.query('SELECT * FROM users', function(error, results, fields) {
        console.log(results);
        res.render('user-list',{
          username: req.session.username,
          user_list: results
        });
});
});

//route index
app.get('/', csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    res.render('login',{ csrfToken: req.csrfToken() });
  });

  //dashboard
app.get('/dashboard', authChecker, csrfProtection, function (req, res) { 
  connection.query('SELECT * FROM users', function(error, results, fields) {
      
    res.render('dashbord', {
      username: req.session.username
    });
    });
    
  });

  //products
  app.get('/main/products', authChecker, csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    connection.query('SELECT * FROM users', function(error, results, fields) {
      
      res.render('products', {
        username: req.session.username
      });
      });
    
  });

//app listening  to host with port
  app.listen('5000', function(req, res){
      console.log('server is listening to port .....5000');
      
  });