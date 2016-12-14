 
var port = 2000;
var server = app.listen(port)
var io = require('socket.io').listen(server);

 

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});
 
var leaders = [];

class Player {
	  constructor(id) {
	    this.score = 0;
	    this.id = id;
	  };
};

Player.list = {};
Player.pCount = 0;

io.on("connection",function(socket){ 
	Player.pCount++; 
	io.emit("pCount",Player.pCount);
	io.emit("leaderUpdate",leaders);
	Player.list[socket.id] = new Player(socket.id);

	socket.on("updateScore",function(){
		Player.list[socket.id].score++;
		updateLeaderList(); 
		socket.emit("updateScore",Player.list[socket.id].score); 
	});

	function updateLeaderList(){
		if (leaders.length == 0){
			leaders.push(Player.list[socket.id]); 
		}else{
			playerFound = false;
			for (player in leaders){ 
				if (leaders[player].id == socket.id){
						playerFound = true;

				}
			}

			if (playerFound == false){
				if (leaders.length < 5){
					leaders.push(Player.list[socket.id]); 
				}
				
			}
			
		}
		orderLeaderList();
		io.emit("leaderUpdate",leaders);
	};

	function orderLeaderList(){ 
		if (leaders.length > 1){
			for (player in leaders){ 
				if (parseInt(player) + 1 != leaders.length){
					if (leaders[parseInt(player) + 1].score > leaders[player].score){//Current player score is lower than the one below them
						var temp = leaders[player]
						leaders[player] = leaders[parseInt(player) + 1];
						leaders[parseInt(player) + 1] = temp; 	
					};
				}
			};
		}
	}
	

	socket.on("disconnect",function(){ 
		delete Player.list[socket.id]; 
		for (player in leaders){
			if (leaders[player].id == socket.id){ 
				leaders.splice(player, 1); 
			}
		}

		Player.pCount--;
		io.emit("pCount",Player.pCount);
		io.emit("leaderUpdate",leaders);

	});



});



