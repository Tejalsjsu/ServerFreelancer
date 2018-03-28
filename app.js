var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongo = require('mongodb');

var index = require('./routes/index');
var users = require('./routes/users');
var mongoCalls = require('./routes/mongoCalls');
var producerAPI = require('./routes/kafka/kafkaProducer');

var mongoSessionURL = "mongodb://localhost:27017/freelancer";

//cors resolution
var cors = require('cors');
var session = require('express-session');
var expressSessions = require('express-session');
var mongoStore = require('connect-mongo')(expressSessions);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//configure the sessions with our application

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
    }
));

app.use(session({
    cookieName: 'session',
    resave: false,
    saveUninitialized: true,
    secret: 'cmpe273_test_string',
    duration: 30 * 60 * 1000,    //setting the time for active session
    activeDuration: 5 * 60 * 1000
})); // setting time for the session to be active when the window is open // 5 minutes set

app.use(expressSessions({
    secret: "CMPE273_passport",
    resave: false,
    //Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, //force to save uninitialized session to db.
    //A session is uninitialized when it is new but not modified.
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 6 * 1000,
    store: new mongoStore({
            url: mongoSessionURL
    })
}));

app.listen(3001);
console.log('Running on port 3001');


app.use('/', index);
app.use('/users', users);
app.use('/mongoCalls', mongoCalls);
app.use('/kafka/kafkaProducer', producerAPI);


app.use(passport.initialize());
app.use(passport.session());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//make our db accessible to the req object
app.use(function (req, res, next) {
    req.db = db;
    next();
});

module.exports = app;
