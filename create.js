
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var db = require('./script/bdd.js');
const url = 'mongodb+srv://belkacem:wC7dMsSX2s0PDBke@cluster0-1po8u.mongodb.net/test?retryWrites=true&w=majority';
var madb;
var create = require('./script/creation.js');
var bodyParser = require('body-parser');
var app = require('express')()
var port = normalizePort(process.env.PORT || '8081');

var server = app.listen(port)
var io = require('socket.io').listen(server);
var playing = false;
var playerWaiting = 0;
var data = {};
var players = {};
var playersInfo = {}
var temp =[]
const MongoStore = require('connect-mongo')(session);

var nmbStar = 100;
var setStars = function(name,color){
  this.name = name;
  this.color = color;
  this.arrive = false;
  this.speed = 50;
  this.velocity;
  this.state = true;
  this.size = Math.random() * 0.7 + 0.3;
  this.linked = false;
  this.corrupt = false;
  this.siblings = [];
  this.albedo = [Math.random() + 0.3,0,true]
  this.coordonate = {
    x : Math.floor(Math.random() * 500) ,
    y : Math.floor(Math.random() * 500)  ,
      velocityX:0,
      velocityY:0,
      speed : this.speed,
      angle : Math.floor(Math.random() * 360),
      angleSpeed : 3,
      destination:{
        x : Math.floor(Math.random() * 500),
        y : Math.floor(Math.random() * 500),
        velocityX :0,
        velocityY :0,
        speed : this.speed,
        destination:{
          x : Math.floor(Math.random() * 500),
          y : Math.floor(Math.random() * 500),
          velocityX:0,
          velocityY:0,
          speed : this.speed,
      }
    }
  }
}

app.use("/socket", express.static(__dirname + "/node_modules/socket.io-client/dist/"));


app.locals.basedir = path.join(__dirname, 'public');

io.on('connection', function(socket){
  var gauge = 0;
  var galaxyServer = {};
  if (app.locals.user) {
    socket.emit('newConnection', app.locals.user.user)
    socket.on('roomConnection',function(msg){
        playerWaiting++
        playersInfo[msg] = {
          id : msg,
          life : 3,
          point : 0,
          albedo : 1,
          speed : 50,
          velocity : 10,
          state : true,
          size :Math.random() * 0.7 + 0.3,
          linked : false,
          corrupt : false,
          siblings : [],
          albedo : [Math.random() + 0.3,0,true],
          x : 0,
          y : 0,
          coordonate : {
              x :0,
              y : 0,
              velocityX:0,
              velocityY:0,
              speed : 1,
              angle : Math.floor(Math.random() * 360),
              angleSpeed : 3,
          }
        }
        players[msg] = socket
        if(playerWaiting === 2 ){
          io.emit("gameInit",{link:'/jeu'})
          playerWaiting = 0;
          playing = true;
        }
    })
    socket.on('disconnectedInSession',function(msg){
      console.log('un player s est déconnecter')
    })
    socket.on('gameIn',function(msg){
      for (var i = 0; i < nmbStar; i++) {
        galaxyServer['star_' + i] = new setStars('star_' + i, 'blue');
      };
      io.emit('goGame',{allPlayer : playersInfo,galaxy : galaxyServer,point: gauge})

    })
    socket.on('mooveClient',function(data){
      io.emit('mooveServer',{player : data.player, x : data.x, y : data.y})
    })
    socket.on('corruptedClient',function(star){
      io.emit('corruptedServer',star)
    })
    socket.on('win',function(star){
      io.emit('winServer',star)

    })
    socket.on('loose',function(star){
      io.emit('looseServer',star)
    })

  }else {
    console.log('Stranger is connected');
  }
});

app.set('view engine', 'pug');
app.set('views', './public');
app.use(cookieParser())
app.use(session({
    secret:'Mongo',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(session({
    store: new MongoStore({
      url: url
  }),
    secret: 'stored',
    resave: false,
    saveUninitialized : false,
    cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 * 2
  }
}));


app.get('/user/:name', function(req,res){
  if (req.session.user === req.params.name) {
    res.redirect('/admin')
  }
  var collectionUser = madb.collection('users');
  collectionUser.find({login:{$eq:req.params.name}}).toArray(function(err, dataName){
    var collectionPost = madb.collection('article');
    collectionPost.find({author:{$eq:dataName[0].login}}).toArray(function(err, dataPost){
      res.render('user',{message:dataName[0].login, post : dataPost,friend:dataName[0].friend})
    })
  });
});


app.get('/',function(req,res){
  var collection = madb.collection('users');
  collection.find({}).toArray(function(err, data){
      res.render('index',{});
  });
});

app.get('/room',function(req,res){
  var collection = madb.collection('users');
  collection.find({}).toArray(function(err, data){
      res.render('room',{message:"En attente d'un autre joueur"});
  });
});
app.get('/jeu',function(req,res){
  var collection = madb.collection('users');
  collection.find({}).toArray(function(err, data){
    io.on('jeuinit', function(socket){
      console.log('en jeu')
    })
    res.render('jeu',{message:"OUII"});
  });
});
app.get('/subscribe',function(req,res){
  var collection = madb.collection('users');
  collection.find({}).toArray(function(err, data){
  })
  res.render('subscribe',{});
});

app.get('/addFriend',function(req,res){
  if (req.session.user){
    var collection = madb.collection('users');
    collection.find({login:{$eq:req.session.user}}).toArray(function(err, data){
      collection.updateOne({login:{$eq:req.session.user}},{$push:{friend:req.query.name}},{upsert:true});
      res.redirect('/User/' + req.query.name );
    })
  }else{
    res.redirect('/login');
  }
});


app.post('/subsResolve', (req, res) => {
  var login = req.body.login;
  var mdp = req.body.passwd;
  var collection = madb.collection('users');

  collection.find({login:{$eq:req.body.login}}).toArray(function(err, data){
    var addUsers = function(){
      var add = new create.User(1,login,mdp,'normal');
      return add
    }
    collection.insertOne(addUsers());
  });
  res.redirect('/admin');
})

app.get('/logout',function(req,res){
    if (req.session) {
      req.session.destroy(function(err){
        if (err) {
          return res.redirect('/')
          throw err;
        }else {
          return res.redirect('/')
        }
      })
    }
});


app.get('/login',function(req,res){
    res.render('login',{});
});


app.post('/loginResolv', (req, res) => {
  var login = req.body.login;
  var mdp = req.body.passwd;
  var collection = madb.collection('users');
  collection.find({login:{$eq:req.body.login}}).toArray(function(err, data){
    if (undefined === data[0]) {
      res.redirect('/Login');
    }else {
      if (req.body.passwd === data[0].passwd) {
        req.session.user = login;
        res.redirect('/admin');
        app.locals.user = req.session
      }else {
        res.redirect('/Login');
      }
    }
  });
})

app.get('/admin',function(req,res){
  if (req.session.user) {
    var collectionPost = madb.collection('article');
    var collectionUser = madb.collection('users');
    collectionUser.find({login:{$eq:req.session.user}}).toArray(function(err, dataUser){
      collectionPost.find({author:{$eq:req.session.user}}).toArray(function(err, dataPost){
        res.render('admin',{message:dataUser[0].login, post : dataPost,friend:dataUser[0].friend,connected:true,author:req.session.user})
      })
    })
  }else {
    res.redirect('/login')
  }
});
app.get('/article',function(req,res){
  if (req.session.user) {
    res.render('article',{message:req.session.user});
  }else {
    res.redirect('/login')
  }
});

app.post('/addArticle',function(req,res){
  if (req.session.user) {
    var title = req.body.title;
    var content = req.body.content;
    var collection = madb.collection('article');

    collection.find({title:{$eq:req.body.title}}).toArray(function(err, data){
      var addPost = function(){
        var add = new create.Article(data.length + 1,title,content,req.session.user);
        return add
      }
      collection.insertOne(addPost());
    });
      res.redirect('/admin')
  }else {
    res.redirect('/login')
  }
})
app.use(function (req, res) {
  res.status(404).render('404');
})

db.connect(url,function(err){
  if (err) {
    throw err
  }else{
    madb = db.get().db('jeuback')
  }
})
