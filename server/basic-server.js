/* Import node's http module: */
var express = require("express");
var http = require("http");
var path = require('path');
var handleRequest = require('./request-handler.js').handler;
var fs = require('fs');

var databaseUrl = process.env.mongoURL || "localMongo";
var collections = ["messages"];
var db = require("mongojs")(databaseUrl, collections);

var app = express();

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

app.use(express.json());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../client')));
app.set('port', process.env.PORT || 3000);


var server = http.createServer(app);
console.log("Listening on port "+ app.get('port'));
server.listen(app.get('port'));

app.all("*", function(req, res, next){
  res.set(defaultCorsHeaders);
  next();
});

app.get('/classes/messages',function(req,res){
   // res.send(200, {"results": app.messageStorage});
    db.messages.find({}).sort({createdAt:-1}, function(err,msgResults){
      if(!err){
        res.send({results: msgResults});
      }else{
        console.log(err);
        res.send(500,"error occurred");
      }
    });
});

app.post('/classes/messages',function(req,res){
    //app.messageStorage.push(req.body);
    req.body.createdAt = new Date();
    db.messages.save(req.body,function(err,result){
      if(!err){
        res.send(201,"posted");
      }else{
        console.log(err);
        res.send(500,"error occurred");
      }
    });
});

app.use(function(req, res, next){
  fs.readFile(__dirname + "/404.html", {encoding: "utf-8"}, function(err, html){
    if(!!err){
      console.log(err);
    }
    res.status(404).send(html);
  });
});
