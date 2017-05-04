var express = require('express');
var app = express();
var path = require('path');
var routes = require('../server/routes/routes.js')(app,express,path);
var colors = require('colors');
colors.setTheme({
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});
var server = app.listen(process.env.PORT || 5000, function() {
    console.log(colors.info("Express server listening on port %s in %s mode "), process.env.PORT, app.settings.env);
});

var io = require('socket.io').listen(server);
 

var leaders_global = [];


Room = function(room_id){
	this.leaders = [];
	this.player_list = [];
}

Player = function(id) {
    this.score = 0;
    this.id = id;
    this.name = "";
    this.current_room = "Global";
}

Player.list = {};
Player.pCount = 0;

io.on("connection", function(socket) {

    io.emit("leaderUpdate", leaders_global);
    Player.list[socket.id] = new Player(socket.id);


    socket.on("updateScore", function() {
        Player.list[socket.id].score++;
        updateLeaderList();
        socket.emit("updateScore", Player.list[socket.id].score);
    });


    socket.on("chat_message",function(msg){ 
    	console.log("chat recieved")
    	console.log(Player.list[socket.id])
    	current_room = Player.list[socket.id].current_room;
		if( msg.indexOf('/join ') >= 0){
		 	join_room(socket, msg.substr(6))
		}else{ 
			message_data = {"name":Player.list[socket.id].name,"message":msg}
    		io.sockets.in(current_room).emit("chat_message" , message_data);
		}


    });

    socket.on("setPlayerName", function(playerName) {
        console.log(colors.info("New Player: %s "), playerName)
        Player.list[socket.id].name = playerName;
        join_room(socket, Player.list[socket.id].current_room)
        Player.pCount++;
        io.emit("pCount", Player.pCount);
    });

    function updateLeaderList() {
        if (leaders_global.length == 0) {
            leaders_global.push(Player.list[socket.id]);
        } else {
            playerFound = false;
            for (player in leaders_global) {
                if (leaders_global[player].id == socket.id) {
                    playerFound = true;

                }
            }

            if (playerFound == false) {
                if (leaders_global.length < 3) {
                    leaders_global.push(Player.list[socket.id]);
                }

            }

        }
        orderLeaderList();
        io.emit("leaderUpdate", leaders_global);
    };

    function join_room(socket,room_id){
    	socket.leave(Player.list[socket.id].current_room) //leave current room
    	if(room_id){
    		socket.join(room_id);
    		Player.list[socket.id].current_room = room_id;
    		console.log("Joining room " + room_id)
    	}else{//No room given
    		return false;
    	}
    }



    function orderLeaderList() {
        if (leaders_global.length > 1) {
            for (player in leaders_global) {
                if (parseInt(player) + 1 != leaders_global.length) {
                    if (leaders_global[parseInt(player) + 1].score > leaders_global[player].score) { //Current player score is lower than the one below them
                        var temp = leaders_global[player]
                        leaders_global[player] = leaders_global[parseInt(player) + 1];
                        leaders_global[parseInt(player) + 1] = temp;
                    };
                }
            };
        }
    }


    socket.on("disconnect", function() {

        console.log(colors.data("Player disconnected - %s "), JSON.stringify(Player.list[socket.id]));
        if (Player.list[socket.id].name) { //If user was playing & had a name
            Player.pCount--;
        }

        delete Player.list[socket.id];
        for (player in leaders_global) {
            if (leaders_global[player].id == socket.id) {
                leaders_global.splice(player, 1);
            }
        }

        io.emit("pCount", Player.pCount);
        io.emit("leaderUpdate", leaders_global);

    });

});