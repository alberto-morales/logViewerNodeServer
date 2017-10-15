	// var bodyParser = require('body-parser');
	//var methodOverride = require("method-override");
	// Middlewares
	//app.use(bodyParser.urlencoded({ extended: false })); 
	//app.use(bodyParser.json()); 
	//app.use(methodOverride());

	var appSettings = require('./util/settings');
	var express = require('express');
	var app = express();
	var cors = require('cors');
	var corsOptions = {
		  "origin": "*",
		  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
		  "preflightContinue": false,
		  "optionsSuccessStatus" : 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
		};
	app.use(cors(corsOptions));
	
	var router = express.Router();
	router.get('/', function(req, res) { 
		 res.send("Welcome to LogViewer v.0.0.1");
	});
	app.use(router);

	// Start server
	var server = app.listen(appSettings.port, function() {		
		 console.log('LogViewer (NodeJS) server running on http://localhost:'+appSettings.port);
	});

	var io  = require('socket.io')(server, { path: '/logViewer'});

	var lastACK = new Date().getTime();
	
	function compruebaPerdidaConexion(socket, remoteFileHarvester) {
		var actualTimestamp = new Date().getTime();
		if (actualTimestamp - lastACK > 10000) {
			socket.disconnect();
			remoteFileHarvester.end();
		} else {
		   lastACK = actualTimestamp;
			setTimeout(function() {
				compruebaPerdidaConexion(socket, remoteFileHarvester);
			}, 10000);	
		}
	}
	
	io.on('connection', function(socket) {
	    console.log('a user connected with id %s', socket.id);
	    
//	    socket.on('ackLogViewer', function(data) {
//	    	lastACK = new Date().getTime();
//	    });
	    
	    socket.on('m4d-logViewer-clientAlive-event', function(data) {
	    	lastACK = new Date().getTime();
	    	console.log('keeping alive server '+lastACK);
	    });
	    
		var remoteFileHarvester = require('./util/remoteFileHarvester');
		remoteFileHarvester.sendData('/home/vagrant/workspace2/fakeLogGenerator/fakeLogGenerator.log',
									 {"host" : "192.168.1.133",
									  "port" : 22,
									  "username" : "vagrant",
									  "password" : "vagrant"
									 },
									 function(data) {
										 socket.emit('m4d-logViewer-serverData-event', ''+data)
									 }
									);
		setTimeout(function() {
			compruebaPerdidaConexion(socket, remoteFileHarvester);
		}, 10000);	

	});
	
