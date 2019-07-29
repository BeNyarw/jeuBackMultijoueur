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
var player = {};
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
  socket.on('gameIn',function(data){
    app.locals.user.playing = true;

    player[app.locals.user.user] = {
      name : app.locals.user.user,
      x : 0,
      y : 0,
      life : 3,
      point : 0,
      socket : socket.id
    };

    socket.emit('gameProvider', app.locals.user.user)
    socket.broadcast.emit('warningOtherPlayer',app.locals.user.user)

    if(Object.keys(player).length === 2){
       app.io.to(player[Object.keys(player)[0]].socket).emit('hey', {name : player[Object.keys(player)[0]].name, otherPlayer : player[Object.keys(player)[1]].name});
       app.io.to(player[Object.keys(player)[1]].socket).emit('hey', {name : player[Object.keys(player)[1]].name, otherPlayer : player[Object.keys(player)[0]].name});
    }else if(Object.keys(player).length === 1){
       app.io.to(player[Object.keys(player)[0]].socket).emit('manque', 'I just met you');
    }else{
      app.io.to(player[Object.keys(player)[0]].socket).emit('trop', 'I just met you');
    }
  })
  socket.on('moove',function(data){
    player[data.user].x = data.x;
    player[data.user].y = data.y;

    app.io.to(player[Object.keys(player)[0]].socket).emit('mooving', {name : player[data.user], x : player[data.user].x, y : player[data.user].y});
    app.io.to(player[Object.keys(player)[1]].socket).emit('mooving', {name : player[data.user], x : player[data.user].x, y : player[data.user].y});

  })
  socket.on('gameOver',function(data){
    console.log(data)
    app.io.to(player[data.looser].socket).emit('loose', 'loose');
    app.io.to(player[data.winner].socket).emit('win', 'win');
    player = {};
    socket.disconnect();
  })
});


module.exports = app;
