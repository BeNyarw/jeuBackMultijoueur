window.addEventListener('load',function(){
  var socket = io('http://localhost:3000');
  var user = '';



  socket.on('connect',function(){
    console.log('connected')
    socket.emit('gameIn',{
      connected : 'true'
    });
    socket.on('gameProvider',function(usr){
      console.log(usr);
    })
    socket.on('warningOtherPlayer',function(usr){
      console.log(usr);
    })
    socket.on('hey',function(usr){
      gameLauncher(usr.name,usr.otherPlayer);
    })
  });


//gameLauncher(data.user);


  var gameLauncher = function(idPlayer,otherPlayer){  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var main = document.getElementById('main');
  var particule = false;
  var superGravity = false;
  var WINDOW_WIDTH = document.getElementById("gameWindow").clientWidth;
  var WINDOW_HEIGHT =  document.getElementById("gameWindow").clientHeight;
  var sidebar =  document.getElementById("sidebar");
  var optionTabShowing = true;
  var nmbStar = 100
  var galaxy = {};
  var users = {};
  var idPlayers = {};
  var otherPlayers = {};
  var spiritMainOther = {};
  var go;
  var grd;
  var gauge = 0;
  var clickTruthy = false;
  var countWing = true;
  var countWing2 = 2;
  var idPlayer = idPlayer;
  var idPlayers = [];
  (function () {  // gestion de ie et des particules, si c'est pas gÃ©rer le jeu est trop lent et l' utilisateur ne peut pas desactiver les particules(les gradients) de lui mÃªme, code repris de stackoverflow : https://stackoverflow.com/questions/19999388/check-if-user-is-using-ie (c'est plus ou moins le mÃªme principe que dans l'un des exo JS DOM)
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
    {particule = false;}
    else
    {particule = false;}
  }())


  var init = {//DÃ©claration de l'objet principal ici : init, c'est dans cette objet qu'est dÃ©clarÃ© les method et fonctions constructeur importante
  // declaration des objets pour les diffÃ©rents calculs
    setSize : function(){
      WINDOW_WIDTH = document.getElementById("gameWindow").clientWidth;
      WINDOW_HEIGHT =  document.getElementById("gameWindow").clientHeight;
      main.style.width =  WINDOW_WIDTH + 'px';
      main.style.height =  WINDOW_HEIGHT + 'px';
      canvas.style.width = WINDOW_WIDTH + 'px';
      canvas.style.height =  WINDOW_HEIGHT + 'px';
      ctx.canvas.width = WINDOW_WIDTH;
      ctx.canvas.height =  WINDOW_HEIGHT;
    },
    setBackground : function(){
      var widthCtx = ctx.canvas.width;
      var heightCtx = ctx.canvas.height;
      ctx.clearRect(0, 0, widthCtx, heightCtx);
    },
    setStars : function(name,color){
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
          x : WINDOW_WIDTH / 2,//Math.floor(Math.random() * (0 - 20)) + (ctx.canvas.width +  50),
          y : WINDOW_HEIGHT / 2,//Math.floor(Math.random() * (0 - 20)) + (ctx.canvas.height + 50),
          velocityX:0,
          velocityY:0,
          speed : this.speed,
          angle : Math.floor(Math.random() * 360),
          angleSpeed : 3,
          destination:{
            x : Math.floor(Math.random() * ctx.canvas.width ),
            y : Math.floor(Math.random() * ctx.canvas.height),
            velocityX :0,
            velocityY :0,
            speed : this.speed,
            destination:{
              x : Math.floor(Math.random() * ctx.canvas.width),
              y : Math.floor(Math.random() * ctx.canvas.height),
              velocityX:0,
              velocityY:0,
              speed : this.speed,
          }
        }
      }
    },
    setGalaxy : function(color){
      for (var i = 0; i < nmbStar; i++) {
        galaxy['star_' + i] = new init.setStars('star_' + i, color);
      };
    },
    setSpiritMain : function(spiritMainObj,color,name){
      spiritMainObj.name = name;
      spiritMainObj.color = color;
      spiritMainObj.arrive = false;
      spiritMainObj.speed = 50;
      spiritMainObj.velocity;
      spiritMainObj.state = true;
      spiritMainObj.size = Math.random() * 0.7 + 0.3;
      spiritMainObj.linked = false;
      spiritMainObj.corrupt = false;
      spiritMainObj.siblings = [];
      spiritMainObj.albedo = [Math.random() + 0.3,0,true]
      spiritMainObj.coordonate = {
          x : WINDOW_WIDTH / 2,//Math.floor(Math.random() * (0 - 20)) + (ctx.canvas.width +  50),
          y : WINDOW_HEIGHT / 2,//Math.floor(Math.random() * (0 - 20)) + (ctx.canvas.height + 50),
          velocityX:0,
          velocityY:0,
          speed : 1,
          angle : Math.floor(Math.random() * 360),
          angleSpeed : 3,
          destination:{
            x : Math.floor(Math.random() * ctx.canvas.width ),
            y : Math.floor(Math.random() * ctx.canvas.height),
            velocityX :0,
            velocityY :0,
            speed : 1,
            destination:{
              x : Math.floor(Math.random() * ctx.canvas.width),
              y : Math.floor(Math.random() * ctx.canvas.height),
              velocityX:0,
              velocityY:0,
              speed : 1,
          }
        }
      };
      spiritMainObj.life = 3;
      spiritMainObj.albedo = 1;
      spiritMainObj.touched = false;
    },
    // declaration d'un objet dessin ou "draw" contenant des methodes pour chaque type de dessin, tout Ã§a pour rendre les choses plus lisible et plus efficace par la suite
    draw: {
      circle : function(x,y,size,color){
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2,false);
        ctx.fill();
      },
      outerCircle : function(x,y,size,thickness,color){
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2,false);
        ctx.stroke();
      },
      gradiCircle: function(x,y,size,color1,color2){
        if (size > 0) {
          grd = ctx.createRadialGradient(x, y, size, x, y, 5 );
          grd.addColorStop(0, 'red');
          grd.addColorStop(1, 'white');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2,false);
          ctx.fill();
        }

      },
      rectangle : function(x,y,sizex,sizey,color){
        ctx.fillStyle = color;
        ctx.fillRect(x, y, sizex,sizey);
      },
      bezierLine : function(x,y,angle,color){
        ctx.translate(x,y)
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.quadraticCurveTo(-15, 1, 0, 35);
        ctx.quadraticCurveTo(15, 1, 0, -20);
        ctx.fillStyle = color ;
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      },

      line : function(x,y,destinationx,destinationy,size,color){
        size = 1;
        ctx.strokeStyle = color
        ctx.lineWidth = size
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(destinationx, destinationy);
        ctx.stroke()
      },
      text : function(string,x,y,color){
        ctx.fillStyle = color;
        ctx.fillText(string, x, y)
      },
      starShape : function(stars){
      //  init.draw.circle(stars.coordonate.x,stars.coordonate.y,11,'#ff1d8a')
        if (true === stars.albedo[2]) {
          if (stars.albedo[1] < stars.albedo[0]) {
            stars.albedo[1] = stars.albedo[1] + 0.01
          }else {
            stars.albedo[2] = false
          }
        }else {
          if (stars.albedo[1] >= 0.2) {
            stars.albedo[1] = stars.albedo[1] - 0.01
          }else {
            stars.albedo[2] = true
          }
        }


        var albedo = stars.albedo[1];
        if (stars.state) {
          if (particule) {
            if (stars.corrupt) {
              init.draw.gradiCircle(stars.coordonate.x,stars.coordonate.y,stars.size * 30,'rgba(3,14,36,0)','rgba(179,50,50,' + albedo + ')')
              init.draw.gradiCircle(stars.coordonate.x,stars.coordonate.y,stars.size * 10,'rgba(3,14,36,0)','rgba(179,50,50,1)')
            }else if(!spiritMain.corrupt ){
              init.draw.gradiCircle(stars.coordonate.x,stars.coordonate.y,stars.size * 30,'rgba(255,255,255,0)','rgba(255,255,255,' + albedo + ')')
              init.draw.gradiCircle(stars.coordonate.x,stars.coordonate.y,stars.size * 10,'rgba(255,255,255,0)','rgba(255,255,255,1)')
            }
          }else {
            if (stars.corrupt) {
                init.draw.circle(stars.coordonate.x,stars.coordonate.y,11,'red')
            }else if(!idPlayers.corrupt ){
                init.draw.circle(stars.coordonate.x,stars.coordonate.y,11,'white')
            }
          }


        }
      },
      spiritShape : function(spiritMain,size,color){

        if (countWing2 <= 2) {
          countWing = false
        }
        if (countWing2 >= 2.3) {
          countWing = true
        }
        if (countWing === false) {
          countWing2 = countWing2 + 0.03
        }
        if (countWing ) {
        countWing2 = countWing2 - 0.03
        }
        init.draw.bezierLine(parseFloat(spiritMain.x),parseFloat(spiritMain.y),countWing2,color)
        init.draw.bezierLine(parseFloat(spiritMain.x),parseFloat(spiritMain.y ),-countWing2,color)
        //init.draw.gradiCircle(parseFloat(spiritMain.x),parseFloat(spiritMain.y),10 + (size * 2),'rgba(153, 198, 232, ' + spiritMain.albedo + ')', color)
      }
    },
    //DÃ©claration des methodes de gestion de mouvement, j'ai ici deux mÃ©thodes et deux faÃ§on d'aborder le mouvement, la deuxiÃ¨me est retenu mais la premiÃ¨re reste Ã  des fins de debug
    movmtTo : function(star,speed){
      var arctangeantex = Math.atan2(Math.abs(star.destination.y - star.y),Math.abs(star.destination.x - star.x))
      var percentx = (45 - arctangeantex * 90 / Math.PI) / 45;
      var percenty = (arctangeantex * 90 / Math.PI) / 45;
      var hypotenuse = Math.sqrt(Math.pow(Math.abs(star.destination.y - star.y),2) + Math.pow(Math.abs(star.destination.x - star.x),2))
      if (star.destination.y - star.y < 0) {
        percenty = -percenty;
      }
      if (star.destination.x - star.x < 0) {
        percentx = -percentx;
      }
      star.velocityY = percenty * star.speed;
      star.velocityX = percentx * star.speed;
      if (star.velocityY < 0.5 && star.velocityX < 0.5  ) {
        star.speed = star.speed + 0.05;
        star.speed = star.speed + 0.05;
      }
      if (star.x <= star.destination.x + 10 && star.x >= star.destination.x - 10 && star.y <= star.destination.y + 10 && star.y >= star.destination.y - 10) {
        star.destination.x = Math.floor(Math.random() * ctx.canvas.width);
        star.destination.y = Math.floor(Math.random() * ctx.canvas.height);
        star.speed = speed;
      }else {
        star.y = star.y + star.velocityY;
        star.x = star.x + star.velocityX;
      }
    },

    //Gestion des mouvements par angle et destination, Ã§a devrait Ãªtre amÃ©liorer dans le futur en ajoutant un vecteur de vitesse dynamique, une forme de gravitÃ© ou plus l'objet est massif/eloignÃ© et plus le vecteur changera - note : C'est toujours en cours d'amÃ©lioration
    movmtTo2: function(star,speed){
      var arctangeantex = Math.atan2(Math.abs(star.destination.y - star.y),Math.abs(star.destination.x - star.x))
      var arctangeantey = Math.atan2(star.destination.y - star.y,star.destination.x - star.x)
      var angleDestination = arctangeantey * (180 / Math.PI)
      var angle;
      var angleon4;
      var percenty;
      var percentx;
      var tesAngleDesti;
      var trajectoirex = 20;
      var trajectoirey = 20;

      if (star.angle > 360) {
        star.angle = 0
      }
      if (star.angle < 0) {
        star.angle = 360
      }
      if (angleDestination < 0) {
        angleDestination = angleDestination + 360;
      }
      tesAngleDesti = star.angle - angleDestination;
      if (star.angle < angleDestination - 2 || star.angle > angleDestination + 2) {
        if (tesAngleDesti > 0) {
          if (tesAngleDesti < 180) {
            star.angle = star.angle - 0.5
          }else{
            star.angle = star.angle + 0.5
          }
        }
        if (tesAngleDesti < 0) {
          tesAngleDesti = Math.abs(tesAngleDesti);
          if (tesAngleDesti < 180) {
            star.angle = star.angle + 0.5
          }else{
            star.angle = star.angle - 0.5
          }
        }
      }
      angle = star.angle;
      angle = angle + 2;
      if (angle <= 90) {
        angleon4 = angle;
        percentx = (90 - angleon4) / 90;
        percenty = angleon4 / 90;
      }else if (angle <= 180) {
        angleon4 = angle - 90
        percenty = (90 - angleon4) / 90;
        percentx = angleon4 / 90;
        percentx = -percentx;
        trajectoirex = -trajectoirex;
      }else if (angle <= 270) {
        angleon4 = angle - 180;
        percentx = (90 - angleon4) / 90;
        percenty = angleon4 / 90;
        percentx = -percentx;
        percenty = -percenty;
        trajectoirex = -trajectoirex;
        trajectoirey = -trajectoirey;
      }else {
        angleon4 = angle - 270;
        percenty = (90 - angleon4) / 90;
        percentx = angleon4 / 90;
        percenty = -percenty;
        trajectoirey = -trajectoirey;
      }
      star.velocityY = percenty * star.speed;
      star.velocityX = percentx * star.speed;
      star.y = star.y + (percenty * star.angleSpeed);
      star.x = star.x + (percentx * star.angleSpeed);
      if (star.x <= star.destination.x + 20 && star.x >= star.destination.x - 20 && star.y <= star.destination.y + 20 && star.y >= star.destination.y - 20) {
        star.destination.x = Math.floor(Math.random() * ctx.canvas.width);
        star.destination.y = Math.floor(Math.random() * ctx.canvas.height);
        star.speed = speed;
      }

      //Quelques fonctions de dÃ©bug


      /*init.draw.text(percentx,star.x+10,star.y,'white')
      init.draw.text(percenty,star.x+10,star.y+10,'white')
      init.draw.text('Speed' + star.speed,star.x+10,star.y+20,'white')
      //init.draw.text('Angle test' + tesAngleDesti,star.x+10,star.y+20,'white')
      init.draw.text('Angle etoile' + star.angle  + ' Original',star.x+10,star.y+30,'white')
      //init.draw.text('Angle etoile' + star.angle  + ' Original',star.x+10,star.y+30,'white')
      init.draw.text('Angle destination' + angleDestination,star.x+10,star.y+40,'white')*/
      //init.debug.destination(star,{percentx,percenty})
    },
    movemtBlackHole : function(blackHole,speed){
      var arctangeantex = Math.atan2(Math.abs(blackHole.destination.y - blackHole.y),Math.abs(blackHole.destination.x - blackHole.x))
      var arctangeantey = (Math.PI / 2) - (Math.atan2(Math.abs(blackHole.destination.y - blackHole.y),Math.abs(blackHole.destination.x - blackHole.x)))

      var percentx = (45 - arctangeantex * 90 / Math.PI) / 45;
      var percenty = (arctangeantex * 90 / Math.PI) / 45;

      if (blackHole.destination.y - blackHole.y < 0) {
        percenty = -percenty;
      }
      if (blackHole.destination.x - blackHole.x < 0) {
        percentx = -percentx;
      }
      blackHole.velocityY = percenty * speed;
      blackHole.velocityX = percentx * speed;

      if (blackHole.x <= blackHole.destination.x + 10 && blackHole.x >= blackHole.destination.x - 10 && blackHole.y <= blackHole.destination.y + 10 && blackHole.y >= blackHole.destination.y - 10) {
        blackHole.velocityY = 0;
        blackHole.velocityX = 0
      }else {
        blackHole.y = blackHole.y + blackHole.velocityY;
        blackHole.x = blackHole.x + blackHole.velocityX;
      }

    },
    //Ici les methodes de gestion des collisions, certaines ne sont plus utilisÃ©e mais toujours utiles surtout pour le projet Back end
    collision: {
      wall : function(obj){
        if (obj.coordonate.x >= canvas.width) {
          obj.coordonate.x = obj.coordonate.x - obj.coordonate.velocityX
        }
        if (obj.coordonate.y >= canvas.height) {
          obj.coordonate.y = obj.coordonate.y - obj.coordonate.velocityY
        }
        if (obj.coordonate.x <= 0) {
          obj.coordonate.x = obj.coordonate.x + 2
        }
        if (obj.coordonate.y <= 0) {
          obj.coordonate.y = obj.coordonate.y + 2
        }
      },
      blackHole: function(blackH,star){
        if (blackH.x <= star.coordonate.x + 10 && blackH.x + 10 >= star.coordonate.x && blackH.y <= star.coordonate.y + 10 && blackH.y + 10>= star.coordonate.y && star.state) {
          if (star.corrupt && blackH.life > 0  && !blackH.touched) {
            blackH.touched = true;
            init.animation.touched(blackH)
            setTimeout(function(){
                blackH.touched = false;
                blackH.life = blackH.life - 1;

            },1000)
          }
          if (blackH.life === 0) {
            blackH.state = false;
          }
        }

      }
    },
      //FonctionnalitÃ© de lien en plus de la collision
    link: function(source,element){
          var dist =  Math.sqrt(Math.pow((source.x - element.coordonate.x), 2) + Math.pow((source.y - element.coordonate.y), 2));

          if (dist < 150 && element.size > 0 && !element.corrupt) {
            init.draw.line(source.x,source.y,element.coordonate.x,element.coordonate.y,element.size * 7,'rgba(255,255,255,' + element.size +')')
            element.size = element.size - 0.01
            element.linked = true;
            init.draw.outerCircle(element.coordonate.x,element.coordonate.y,element.size * 30,2,'rgba(255,255,255,0.5)')
            init.draw.gradiCircle(element.coordonate.x,element.coordonate.y,element.size * 30,'rgba(3,14,36,0)','rgba(255,255,255,1)')
          }else{
            element.linked = false;
          }
          if (element.size <= 0.3 && !element.corrupt) {
            element.corrupt = true;
            element.size = 1;
            gauge = gauge + 1;
          }

    },
    animation : { // Objet d'animation (trÃ©s peu fournie peut aussi Ãªtre amÃ©liorer)
      counter : true,
      touched : function(element){
          var scin = setInterval(function(){
            if (element.touched) {
            if (element.albedo === 0) {
              this.counter = false
            }
            if (element.albedo === 1) {
              this.counter = true
            }
           if (this.counter === false) {
              element.albedo = element.albedo + 1
            }
            if (this.counter && element.albedo >= 1) {
              element.albedo = element.albedo - 1
            }

          }else {
            clearInterval(scin);
            element.albedo = 1;
          }
          },100)
      }
    },
    hud : function(){ //L'affichage des vies, techno dÃ©bloquÃ©s, jauge de compÃ©tences
      for (var i = 0; i < idPlayers.life; i++) {
        ctx.translate(50 ,40 + (i *50))
        ctx.rotate(3.15);
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.quadraticCurveTo(-30, 1, 0, -10);
        ctx.quadraticCurveTo(30, 1, 0, -30);
        ctx.fillStyle = 'red' ;
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      };
      //Barre de JS
      init.draw.rectangle((WINDOW_WIDTH / 2) - 101, 9 ,202,12,'white')
      init.draw.rectangle((WINDOW_WIDTH / 2) - 100,10,gauge * 2,10,'red')
      init.draw.text(gauge + '%',(WINDOW_WIDTH / 2), 35,'white')
      if (gauge >= 33) {
        init.draw.rectangle(30,200,50,50,'white')

      }
      if (gauge >= 66) {
        init.draw.rectangle(30,260,50,50,'white')

      }
      if (gauge >= 99) {
        init.draw.rectangle(30,320,50,50,'white')

      }


    },
    debug:{ // Objet pour contenir diffÃ©rentes mÃ©thode de dÃ©bug
      destination : function(star,context){
        init.draw.line(star.x,star.y,star.destination.x,star.destination.y,'white')
        init.draw.rectangle(star.destination.x,star.destination.y,10,10,'white')
        /*init.draw.text(star.destination.y - star.y + ' - ' + context.percenty,star.x + 10,star.y)
        init.draw.text(star.destination.x - star.x + ' - ' + context.percentx,star.x + 10,star.y +10)*/
      }
    },
    gameOver: function(idPlayers){ // Gestion du Game over (fin de partie littÃ©ral, activÃ© en gagnant ou en perdant)
      idPlayers.coordonate.destination.x = WINDOW_WIDTH / 2;
      idPlayers.coordonate.destination.y = WINDOW_HEIGHT / 2;
      sidebar.style.display = 'block';
      canvas.style.cursor = 'auto'
      cancelAnimationFrame(go);
    },
    mainLoop : function(){ //Boucle principal
      init.setBackground();
      init.hud();
      if (idPlayers.life === 0) {
        idPlayers.state = false;
      }
      if (gauge === nmbStar) {

        socket.emit('gameOver',{looser : otherPlayer,winner: idPlayer})
      }
      if (!idPlayers.state) {

        socket.emit('gameOver',{looser : idPlayer,winner: otherPlayer})

      }else {
        init.draw.spiritShape(idPlayers,idPlayers.size,idPlayers.color)
        init.draw.spiritShape(otherPlayers,otherPlayers.size,otherPlayers.color)
      }
      for (var star in galaxy) {
        star = galaxy[star]
        init.collision.blackHole(idPlayers,star)
        init.draw.starShape(star)
        init.movmtTo2(star.coordonate,10)
        if (clickTruthy) {
          init.link(idPlayers,star);
        }
      }
  }

}//Fin de l'objet Init !




  var startGame = function(){ //Fonction de dÃ©marrage du jeu
  init.setSize();
  init.setGalaxy('white');

  idPlayers = new init.setStars(idPlayer, 'white');
  otherPlayers = new init.setStars(otherPlayer, 'red');
  init.setSpiritMain(idPlayers,'white',idPlayer)
  init.setSpiritMain(otherPlayers,'red',otherPlayer)

  gauge = 0;
  }

  startGame() //Start

  var animate = function(){
    go = requestAnimationFrame(animate);
    init.mainLoop();
  }


  animate()

  // Handlers for the mouse and button of panel
  canvas.addEventListener('mousedown',function(event){
      clickTruthy = true;
  })
  canvas.addEventListener('mouseup',function(event){
      clickTruthy = false;
  })
  canvas.addEventListener('mousemove',function(event){
      if (idPlayers.state) {
          socket.emit('moove',{
            user : idPlayer,
            x: event.offsetX,
            y: event.offsetY
          })
      }
    })
    socket.on('mooving',function(data){

        if(data.name.name === idPlayer){
          idPlayers.x = data.x
          idPlayers.y = data.y
        }else{
          otherPlayers.x = data.x
          otherPlayers.y = data.y
        }
    })
    socket.on('loose',function(data){
      init.gameOver(idPlayers)
      msg.innerHTML = "Perdu"
      setTimeout(function(){
        socket.disconnect();
        window.location.replace('http://localhost:3000/logout')
      },2000)


    })
    socket.on('win',function(data){
      init.gameOver(idPlayers)
      msg.innerHTML = "Gagné !"
      setTimeout(function(){
        socket.disconnect()
        window.location.replace('http://localhost:3000/logout')
      },2000)

    })

window.addEventListener('resize',function(){ // Gestion de redimension de la page
  init.setSize();
});


};
})
