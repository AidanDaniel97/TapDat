var port = 5000;
var ioc = require( 'socket.io-client' );


clientList = [];


function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}




function clientBot(){ 
	this.socket = "";


	this.addClient = function(){
		this.socket = ioc.connect( "http://localhost:" + port );


		this.socket.once( "connect", function () {
		    console.log( 'Client: Connected to port ' + port );  

		});
	};

	this.setname = function(){
		 playerName = randomString(10, '#aA');
		this.socket.emit("setPlayerName", playerName);  
	}

	this.tap = function(){
		this.socket.emit("updateScore");
	}
}

 
function connectClients(number){
	for (i = 0; i < number; i++) { 
	    clientList[i] = new clientBot(); 
	    clientList[i].addClient();
	};

	//Clients added - start timer
	for (var i in clientList){
			clientList[i].setname();
	}

	setInterval(function(){ 
		
		for (var i in clientList){
			clientList[i].tap();
		}  
	},1000)

}


connectClients(5);



