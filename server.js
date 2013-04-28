var http = require('http'), 
	express = require('express'), 
	routes = require('./routes'), 
  path = require('path')
  pubnub = require("pubnub").init({
    publish_key : "usepubkeyhere", 
    subscribe_key : "usesubkeyhere"
  });

//create the express app
var app = express();

//configure the express app
app.configure(function(){
  app.set('port', process.env.PORT || 1337);
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});
  
//Routes:
//TODO: seperate this into files.
app.get('/', function (req, res){
  res.render('index.html'); 
});
app.post('/pushmessage', function (req, res) {
  //console.log(req.body);
  
  //TODO: make sure we validate this....
  var payload = {
    channel : req.body.channel,
    message : req.body.message,
    //debubing purposes only.
    callback : function (m) {
      console.log(m);
    }
  };
  pubnub.publish(payload);
});

//Start the server:
http.createServer(app).listen(app.get('port'), function(){
	console.log("express server listening on port " + app.get('port'));
});