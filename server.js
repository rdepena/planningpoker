var http = require('http'), 
  express = require('express'),
  path = require('path')
  pubnub = require("pubnub").init({
    publish_key : "pub", 
    subscribe_key : "sub"
  });

//create the express app
var app = express();

//configure the express app
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
   app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
  
//Routes:
app.get('/', function (req, res){
  res.render('index.html'); 
});
app.post('/publish', function (req, res) {
  console.log(req.body);  
  
  //TODO: make sure we validate this....
  var payload = {
    channel : req.body.channel,
    message : req.body.message
  };
  pubnub.publish(payload);

  //we don't need to wait for the call back to send the ok, we fire and forget.
  res.send("ok");
});

app.get('*', function(req, res){
  res.render('404.html');
});

//Start the server:
var port = process.env.PORT || 5000;
http.createServer(app).listen(port, function(){
  console.log("express server listening on port " + port);
});