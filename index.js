var express = require('express')
    , path = require('path')
    , csrf = require('csurf')
    , cookieParser = require('cookie-parser')
    , mysqli = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');


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
   
  connection.connect((function(err) {
    if (err) {
      console.log('Error While Connecting');
      return;
    }
   
    console.log('Connected..');
  }));

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;

                request.flash('success','welcome '+ request.body.username);
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

//route index
app.get('/', csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    res.render('login',{ csrfToken: req.csrfToken() });
  });

app.get('/dashboard', csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    res.render('dashbord', { csrfToken: req.csrfToken() });
    
  });

  //products
  app.get('/main/products', csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    res.render('products', { csrfToken: req.csrfToken() });
    
  });


  app.listen('9000', function(req, res){
      console.log('server is listening to port .....9000');
  });