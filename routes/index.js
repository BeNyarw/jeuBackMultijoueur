var express = require('express');
var router = express.Router();
const url = 'mongodb+srv://belkacem:wC7dMsSX2s0PDBke@cluster0-1po8u.mongodb.net/test?retryWrites=true&w=majority'
var madb;
var create = require('../bdd/schema.js');
var mongo = require('../bdd/bdd.js');
var session = require('express-session');
/* GET home page. */

mongo.connect(url,function(err){
  if (err) {
     throw err
   }else{
    madb = mongo.get().db('backjeu')
   }
})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jeu d Belka !' });
});

router.get('/admin',function(req,res){
  if (req.session.user) {
    var collectionUser = madb.collection('users');
    collectionUser.find({connected:{$eq:true}}).toArray(function(err, dataUser){
      res.render('admin', { title: req.session.user});
    })
  }else {
    res.redirect('/login')
  }
});
router.get('/subscribe', function(req, res, next) {
  res.render('subscribe', { title: 'Jeu d Belka !' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Jeu d Belka !' });
});
router.get('/room', function(req, res, next) {


  res.render('room', { title: 'Jeu d Belka !' });
});

router.post('/subscribe', (req, res) => {
  var login = req.body.login;
  var mdp = req.body.password;
  var collection = madb.collection('users');

  collection.find({login:{$eq:req.body.login}}).toArray(function(err, data){
    var addUsers = function(){
      var add = new create.User(1,login,mdp,'normal');
      return add
    }
    collection.insertOne(addUsers());
  });
  res.redirect('/login');
})

router.post('/login', (req, res) => {
  var login = req.body.login;
  var mdp = req.body.password;
  var collection = madb.collection('users');
  collection.find({login:{$eq:req.body.login}}).toArray(function(err, data){
    if (undefined === data[0]) {
      res.redirect('/Login');
    }else {
      if (req.body.password === data[0].passwd) {
        req.session.user = login;
        req.app.locals.user = req.session;
        collection.updateOne({login:{$eq:req.session.user}},{$set:{connected:true}});
        res.redirect('/admin');
      }else {
        res.redirect('/admin');
      }
    }
  });
})
router.get('/logout',function(req,res){
    var collection = madb.collection('users');
    if (req.session) {
      collection.updateOne({login:{$eq:req.session.user}},{$set:{connected:false}});
      req.session.destroy(function(err){
        if (err) {
          return res.redirect('/login')
          throw err;
        }else {
          return res.redirect('/login')
        }
      })
    }
});


module.exports = function (io) {
  mongo.connect(url,function(err){
    if (err) {
       throw err
     }else{
      madb = mongo.get().db('backjeu')
      io.on('connection', function (socket) {
        var collectionUser = madb.collection('users');
        collectionUser.find({connected:{$eq:true}}).toArray(function(err, dataUser){
          let arrConnected = [];
          dataUser.map((user,index)=>{
            arrConnected.push(user.login)
          })
          socket.emit('userConnected',arrConnected)
        })
      });

     }
  })
    return router;
};
