/**
 * Module dependencies.
 */

var express = require('express'),
  fs = require('fs'),
  config = require('./config');

var app = module.exports = express.createServer();

//twitter geo-located stream
var io = require('socket.io').listen(app),
	observer = new (require('events').EventEmitter)(),
	twitter = require('ntwitter'),
	twit = new twitter(config.twitterAPI);

twit.stream('statuses/filter', {'locations': '-180,-90,180,90'}, function(stream)
{
	stream.on('data', function(data)
	{
		if (data.entities.media != undefined)
			observer.emit('twitter', data);
	});
});

io.sockets.on('connection', function(socket)
{
	observer.on('twitter', function(data)
	{
		socket.emit('twitter', data);
	})
});

// Configuration
app.configure(function()
{
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: config.secret }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function()
{
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function()
{
  app.use(express.errorHandler());
});

//dynamic helpers
app.dynamicHelpers(
{
  flash: function(req, res){ return req.flash(); }
});

require('./boot')(app, config, fs);

app.listen(config.port, function()
{
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
