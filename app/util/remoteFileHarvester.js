'use strict';

(function() {
	
	function RemoteFileHarvester () {
		var self = this;
		
		var Client = require('ssh2').Client;
		 
		self.conn = new Client();
	};

//	var encDecrypter = require('../util/encDecrypter');

	RemoteFileHarvester.prototype.sendData = function(fileFullPath, hostConfig, callbackFunction) {
		
		var self = this;
		
//		var encryptedPassword = hostConfig.password;
//		var plainPassword = encDecrypter.decrypt(encryptedPassword);
//		hostConfig.password = plainPassword;
		
		self.conn.on('ready', function() {
		  console.log('Client :: ready');
		  self.conn.shell(function(err, stream) {
			  if (err) throw err;
			  stream.on('close', function() {
				console.log('stream closed, ending connection');
				self.conn.end();
			  }).on('data', function(data) {
				  callbackFunction(data);
			      // console.log(''+data);
			  }).stderr.on('data', function(data) {
			      console.log('STDERR: ' + data);
			  });
			  stream.end('tail -f ' + fileFullPath + '\n');
		  });
		}).connect({
		  host: hostConfig.host,
		  port: hostConfig.port,
		  username: hostConfig.username,
		  password: hostConfig.password
		});
	}
	
	RemoteFileHarvester.prototype.end = function() {
		var self = this;
		
		console.log('ending harvest');
		
		self.conn.end();
	}
	
	module.exports = new RemoteFileHarvester();

})();