
exports.User = function(id,login,passwd,lvl){
  this.id = id;
  this.login = login;
  this.passwd = passwd;
  this.lvl = lvl;
  this.friend=[];
};
exports.Article = function(id,title,content,author){
  this.id = id;
  this.title = title;
  this.content = content;
  this.author = author;
  this.date = new Date();
};
exports.Comment = function(id,content,author,articleId){
  this.id = id;
  this.content = content;
  this.author = author;
  this.articleId = articleId;
};
