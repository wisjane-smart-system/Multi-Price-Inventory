var express = require('express'),
  path = require('path'),
  csrf = require('csurf'),
  cookieParser = require('cookie-parser'),
  mysqli = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var async = require('async');

//for encryption
var bcrypt = require('bcrypt');

// setup route middlewares
var csrfProtection = csrf({
  cookie: true
});

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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// we need this because "cookie" is true in csrfProtection
app.use(cookieParser());


//set views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//database connection
var connection = mysqli.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'multiprice',
  multipleStatements: true
});

//database connection
connection.connect((function (err) {
  if (err) {
    console.log('Error While Connecting');
    return;
  }

  console.log('Connected..');
}));

//logout route
app.get('/logout', csrfProtection, function (req, res, next) {
  req.session.loggedin = false;
  req.flash('danger', 'logout successfully');
  res.redirect('/');

});

// app.get('/test', function(req, res){
//   connection.query('SELECT username FROM users; SELECT email FROM users', [1, 2], function(err, results, fields){
//     console.log(results[0])
//     console.log(results[1])
//   })
// })
+
  //login route
  app.post('/auth', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    connection.query('SELECT * FROM users WHERE username = ?', [username], function (error, results, fields) {
      if (results.length > 0) {
        bcrypt.compare(password, results[0].password, function (err, result) {
          if (result == true) {
            request.session.loggedin = true;
            request.session.username = username;
            request.flash('success', 'welcome ' + request.session.username);
            response.redirect('/dashboard');
          } else {
            request.flash('danger', 'Incorrect Username and/or Password!');
            response.redirect('/');
          }
        })
      } else {
        request.flash('warning', 'Details not Found! Please Contact your Admin for registration')
        response.redirect('/')
      }
    })
  });

//insert into temp_sales table
app.post('/product/sell', function(req, res){
  var proQua = req.body.quantityQ;
  connection.query('INSERT INTO temp_sales VALUES ("", "'+proQua+'", "'+proQua+'", "'+proQua+'", "'+proQua+'", "'+proQua+'")', function(err, results, fields){

      req.flash('success', 'Done !!!');
      res.redirect('/product/sell');
  })
})

//delete temp_sale data

app.post('/product/cancel', function(req,res){

  connection.query('DELETE FROM temp_sales', function(err,results,fields){

      req.flash('success', 'cancelled successful')
      res.redirect('/product/sell')
  })
})



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
app.get('/user-list', authChecker, csrfProtection, function (req, res) {
  connection.query('SELECT *, (SELECT COUNT(*)  FROM users) as total FROM users; SELECT *, (SELECT COUNT(*) FROM products) as totalq FROM products; SELECT SUM(total_cost) as totalQ FROM products', [1, 2, 3], function (error, results, fields) {
    for (var i = 0; i < results[0].length; i++) {

      for (var j = 0; j < results[1].length; j++) {
        var vim = results[1][j];
      }
      for (var k = 0; k < results[2].length; k++) {
        var to = results[2][k];
      }
      var row = results[0][i];
    }

    res.render('user-list', {
      username: req.session.username,
      totalQ: to.totalQ,
      user: row.total,
      user_list: results[0],
      product: vim.totalq,
      product_list: results[1],
    });
  });
});

//dashboard
app.get('/dashboard', authChecker, csrfProtection, function (req, res) {
  connection.query('SELECT *, (SELECT COUNT(*)  FROM users) as total FROM users; SELECT *, (SELECT COUNT(*) FROM products) as totalq FROM products; SELECT SUM(total_cost) as totalQ FROM products', [1, 2, 3], function (error, results, fields) {
    for (var i = 0; i < results[0].length; i++) {

      for (var j = 0; j < results[1].length; j++) {
        var vim = results[1][j];
      }
      for (var k = 0; k < results[2].length; k++) {
        var to = results[2][k];
      }
      var row = results[0][i];
    }

    res.render('dashbord', {
      username: req.session.username,
      totalQ: to.totalQ,
      user: row.total,
      product: vim.totalq,
      product_list: results[1],
    });
  });
});

//products
app.get('/products', authChecker, csrfProtection, function (req, res) {

  connection.query('SELECT *, (SELECT COUNT(*)  FROM users) as total FROM users; SELECT *, (SELECT COUNT(*) FROM products) as totalq FROM products; SELECT SUM(total_cost) as totalQ FROM products', [1, 2, 3], function (error, results, fields) {
    for (var i = 0; i < results[0].length; i++) {

      for (var j = 0; j < results[1].length; j++) {
        var vim = results[1][j];
      }
      for (var k = 0; k < results[2].length; k++) {
        var to = results[2][k];
      }
      var row = results[0][i];
    }

    res.render('products', {
      username: req.session.username,
      totalQ: to.totalQ,
      user: row.total,
      product: vim.totalq,
      product_list: results[1],
    });
  });

});

//products
app.get('/inv-prod', authChecker, csrfProtection, function (req, res) {

  connection.query('SELECT *, (SELECT COUNT(*)  FROM users) as total FROM users; SELECT *, (SELECT COUNT(*) FROM products) as totalq FROM products; SELECT SUM(total_cost) as totalQ FROM products', [1, 2, 3], function (error, results, fields) {
    for (var i = 0; i < results[0].length; i++) {

      for (var j = 0; j < results[1].length; j++) {
        var vim = results[1][j];
      }
      for (var k = 0; k < results[2].length; k++) {
        var to = results[2][k];
      }
      var row = results[0][i];
    }

    res.render('products', {
      username: req.session.username,
      totalQ: to.totalQ,
      user: row.total,
      product: vim.totalq,
      product_list: results[1],
    });
  });

});

//add products route middleware
app.post('/addproduct', function (request, response) {
  var productName = request.body.productname;
  var productQuantity = request.body.productquantity;
  var totalCost = request.body.totalcost;
  var cashPrice = request.body.cashprice;
  var chequePrice = request.body.chequeprice;
  var creditPrice = request.body.creditprice;
  connection.query('INSERT INTO products VALUES ("","' + productName + '","' + productQuantity + '","' + totalCost + '","' + cashPrice + '","' + chequePrice + '","' + creditPrice + '"); INSERT INTO inventories VALUES ("","' + productName + '","' + productQuantity + '","' + totalCost + '","' + cashPrice + '","' + chequePrice + '","' + creditPrice + '")',[1, 2], function (error, results, fields) {
    if(results.length > 0){
      request.flash('success', 'Product Added Successfully')
      response.redirect('/products')
    }
    else{
      request.flash('danger', error)
      response.redirect('/products')
    }
  })
});

//sell product
app.get('/product/sell', authChecker, csrfProtection, function (req, res) {

  connection.query('SELECT *, (SELECT COUNT(*)  FROM users) as total FROM users; SELECT *, (SELECT COUNT(*) FROM products) as totalq FROM products; SELECT SUM(total_cost) as totalQ FROM products; SELECT * FROM temp_sales as tempSa' , [1, 2, 3, 4], function (error, results, fields) {
    for (var i = 0; i < results[0].length; i++) {

      for (var j = 0; j < results[1].length; j++) {
        var vim = results[1][j];
      }
      for (var k = 0; k < results[2].length; k++) {
        var to = results[2][k];
      }
      for (var l = 0; l < results[3].length; l++) {
        var temp = results[3][l];
      }
      var row = results[0][i];
    }

    res.render('sell', {
      username: req.session.username,
      totalQ: to.totalQ,
      user: row.total,
      product: vim.totalq,
      product_list: results[1],
      temp1: results[3]
    });
  });
})

//add product
app.get('/add_products', authChecker, csrfProtection, function (req, res) {
  connection.query('SELECT *, (SELECT COUNT(*)  FROM users) as total FROM users; SELECT *, (SELECT COUNT(*) FROM products) as totalq FROM products; SELECT SUM(total_cost) as totalQ FROM products', [1, 2, 3], function (error, results, fields) {
    for (var i = 0; i < results[0].length; i++) {

      for (var j = 0; j < results[1].length; j++) {
        var vim = results[1][j];
      }
      for (var k = 0; k < results[2].length; k++) {
        var to = results[2][k];
      }
      var row = results[0][i];
    }

    res.render('add_products', {
      username: req.session.username,
      totalQ: to.totalQ,
      user: row.total,
      product: vim.totalq,
      product_list: results[1],
    });
  });
})

//route index
app.get('/', csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.render('login', { csrfToken: req.csrfToken() });
});

//app listening  to host with port
app.listen('5000', function (req, res) {
  console.log('server is listening to port .....5000');

});