/*(function(){
    var socket = io('http://localhost:3000');
    socket.on('connect',function(){
      console.log('connected Client');
    });
    socket.on('getCount',function(count){
      console.log(count)
    });
    socket.on('userConnected',function(user){
      var usersList = document.getElementById('userConnected');
      for(let i = 0; i < user.length ; i++){
        var listToken = document.createElement('li');
        usersList.appendChild(listToken)
        listToken.innerHTML = user[i];
      }
    });

  })();
*/
