var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config/config.js');
var logger = require('morgan');
const url = 'mongodb://localhost:27017';
var madb;
var mongo = require('./bdd/bdd.js');
var bodyParser = require('body-parser');

var app = express();
app.io = require('socket.io')();
var routes = require('./routes/index')(app.io);
var usersRouter = require('./routes/users');


mongo.connect(url,function(err){
  if (err) {
     throw err
   }else{
    madb = mongo.get().db('backjeu')
   }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('public', path.join(__dirname, 'public'));
app.set('view engine', 'pug');
app.use("/socket", express.static(__dirname + "/node_modules/socket.io-client/dist/"));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized : false
}));

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

app.io.on('connection', function(socket){
  socket.on('moove', function(messages){
    app.io.emit('mooveDisplay',{
      user : app.locals.user.user,
      x : messages.x,
      y : messages.y
    })

    socket.broadcast.emit('mooveOtherDisplay',{
      user : messages.user,
      x : messages.x,
      y : messages.y
    })
  })


  socket.on('newPlayer', function(messages){
    socket.emit('newPlayerAssign',{
      user : app.locals.user.user
    })
    socket.broadcast.emit('OtherPlayerAssign',{
      user : app.locals.user.user,
      sockeid : socket.id
    })
  })
  socket.on('okep', function(messages){
    console.log(messages.user)
    socket.broadcast.to(messages.sockeid).emit('vlaENCULE',{
      user : messages.user
    })
  })

  if (app.locals.user) {

  }else {
    console.log('Stranger is connected');
  }
});


module.exports = app;
