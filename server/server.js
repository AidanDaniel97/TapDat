var express = require('express'); 
var app = express();   
var path = require('path');
var server = app.listen(process.env.PORT || 5000,function(){

  console.log("Express server listening in %s mode", process.env.PORT, app.settings.env);
})
var io = require('socket.io').listen(server);

app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function(req, res){
	res.send('index.html'); 
}); 
 
var leaders = [];

class Player {
	  constructor(id) {
	    this.score = 0;
	    this.id = id;
	    this.name = "";
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

	socket.on("setPlayerName",function(playerName){
		console.log("New Player: " , playerName)
		Player.list[socket.id].name = playerName;
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

		console.log("Player disconnected - " , Player.list[socket.id])
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



