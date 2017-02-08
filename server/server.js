var express = require('express');
var app = express();
var path = require('path');
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



app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function(req, res) {
    res.send('index.html');
});

var leaders = [];


Player = function(id) {
    this.score = 0;
    this.id = id;
    this.name = "";
}

Player.list = {};
Player.pCount = 0;

io.on("connection", function(socket) {

    io.emit("leaderUpdate", leaders);
    Player.list[socket.id] = new Player(socket.id);


    socket.on("updateScore", function() {
        Player.list[socket.id].score++;
        updateLeaderList();
        socket.emit("updateScore", Player.list[socket.id].score);
    });


    socket.on("chat_message",function(msg){
    	console.log("New chat message")
    	io.emit("chat_message" , msg);
    });

    socket.on("setPlayerName", function(playerName) {
        console.log(colors.info("New Player: %s "), playerName)
        Player.list[socket.id].name = playerName;
        Player.pCount++;
        io.emit("pCount", Player.pCount);
    });

    function updateLeaderList() {
        if (leaders.length == 0) {
            leaders.push(Player.list[socket.id]);
        } else {
            playerFound = false;
            for (player in leaders) {
                if (leaders[player].id == socket.id) {
                    playerFound = true;

                }
            }

            if (playerFound == false) {
                if (leaders.length < 5) {
                    leaders.push(Player.list[socket.id]);
                }

            }

        }
        orderLeaderList();
        io.emit("leaderUpdate", leaders);
    };

    function orderLeaderList() {
        if (leaders.length > 1) {
            for (player in leaders) {
                if (parseInt(player) + 1 != leaders.length) {
                    if (leaders[parseInt(player) + 1].score > leaders[player].score) { //Current player score is lower than the one below them
                        var temp = leaders[player]
                        leaders[player] = leaders[parseInt(player) + 1];
                        leaders[parseInt(player) + 1] = temp;
                    };
                }
            };
        }
    }


    socket.on("disconnect", function() {

        console.log(colors.data("Player disconnected - %s "), JSON.stringify(Player.list[socket.id]));
        if (Player.list[socket.id].name) { //If user was playing / had a name
            Player.pCount--;
        }

        delete Player.list[socket.id];
        for (player in leaders) {
            if (leaders[player].id == socket.id) {
                leaders.splice(player, 1);
            }
        }

        io.emit("pCount", Player.pCount);
        io.emit("leaderUpdate", leaders);

    });



});