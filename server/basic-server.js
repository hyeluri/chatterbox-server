/* Import node's http module: */
var express = require("express");
var http = require("http");
var path = require('path');
var handleRequest = require('./request-handler.js').handler;

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
app.set('ip', "127.0.0.1");

var server = http.createServer(app);
console.log("Listening on http://" + app.get('ip') + ":" + app.get('port'));
server.listen(app.get('port'), app.get('ip'));

app.all("*", function(req, res, next){
  res.set(defaultCorsHeaders);
  next();
});

//app.get('/classes/:id', function())

////////////////////////////////////
//everything from request-handler
////////////////////////////////////

var storage = [];
var messageStorage = [];

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  if(request.method === "OPTIONS"){
    response.writeHead(statusCode,headers);
    response.end("ALLOW: GET POST OPTIONS");
  }

  if(request.url === '/classes/messages'){
    messages(request,response,headers);
  }

  if(request.url.match(/\/classes\/room[0-9]*\/?/)){
    //app.get('/classes/room:id', function(req, res){});
    room(request,response,headers);
  }else{

    statusCode = 404;
    /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);

    /* Make sure to always call response.end() - Node will not send
     * anything back to the client until you do. The string you pass to
     * response.end() will be the body of the response - i.e. what shows
     * up in the browser.*/

    response.end("Request failed");
  }
};

var messages = function(request,response,headers){

  if(request.method === "GET"){
    response.writeHead(200,headers);
    //response.write();
    var obj = JSON.stringify({
      "results": messageStorage
    });
    response.end(obj);
  }
  if(request.method === "POST"){
    var tempStore = "";
    request.on('data', function(data){
      tempStore += data;
    });
    request.on('end', function(){
      messageStorage.push(JSON.parse(tempStore));
    });
    response.writeHead(201,headers);
    response.end("posted");
  }

};

var room = function(request,response,headers){

  if(request.method === "GET"){
    response.writeHead(200,headers);
    //response.write();
    var obj = JSON.stringify({
      "results": storage
    });
    response.end(obj);
  }
  if(request.method === "POST"){
    var tempStore = "";
    request.on('data', function(data){
      tempStore += data;
    });
    request.on('end', function(){
      storage.push(JSON.parse(tempStore));
    });
    response.writeHead(201,headers);
    response.end("posted");
  }

};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */