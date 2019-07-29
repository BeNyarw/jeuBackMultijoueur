exports.User = function(id,login,passwd){
  this.id = id;
  this.login = login;
  this.passwd = passwd;
  this.connected  = false;
  this.playing = false;
};
