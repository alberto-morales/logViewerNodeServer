'use strict';

(function() {
	
	var crypto = require('crypto'),
    	algorithm = 'AES-128-ECB',
    	secret = new Buffer('466f75724675636b696e6754696d6573','hex'); //fFT
	
	function EncDecrypter () {
		var self = this;
		
	};

	EncDecrypter.prototype.encrypt = function(source) {
		var iv = new Buffer('');
	    var chunks = [];
	    var cipher = crypto.createCipheriv(algorithm, secret, iv);
		chunks.push(cipher.update(
				new Buffer(source, 'binary'),
			    'buffer', 'base64'));
		chunks.push(cipher.final('base64'));
		var encryptedString = chunks.join('');
		return encryptedString;
	}

	EncDecrypter.prototype.decrypt = function(sourceBase64) {
		var source = new Buffer(sourceBase64, 'base64');

		var ivBuffer = new Buffer('');
		var decipher = crypto.createDecipheriv(algorithm, secret, ivBuffer);
		var chunks = [];
		chunks.push(decipher.update(source, 'buffer', 'hex'));
		chunks.push(decipher.final('hex'));
		var decryptedBuffer = new Buffer(chunks.join(''), 'hex');
		return decryptedBuffer.toString('binary');
	}
	
	module.exports = new EncDecrypter();

})();