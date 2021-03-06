var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken')

// include files for mongodb and mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://serv-api:pl33zn0h4ck@proximus.modulusmongo.net:27017/Eha7ruho');
require('./models/message')
require('./models/user')

// routes
var routes = require('./routes/index');
var msgs = require('./routes/msgs');

var app = express();

var configureMincer = require('./app/config/mincer');
configureMincer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('/*', function (req, res, next) {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key')
  if (req.method == 'OPTIONS') { res.sendStatus(200) } else { next() };
})

// Auth Middleware - This will check if the token is valid
app.all('/api/v1/*', [require('./middleware/validateRequest')])

app.use('/', routes);
// app.use('/msgs', msgs);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json( { "status" : err.status || 500
              , "message" : err.message
              , "error" : err
              } )
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
