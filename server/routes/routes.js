var commands_list = require("../../server/config/config.js")
module.exports = function (app,express,path) {
    // set up the routes themselves 

	app.use(express.static(path.join(__dirname, '../../client')));
	app.set("view engine","ejs");


	app.get('/', function(req, res) {
	    res.render('index',{'commands':commands_list});
	});
};