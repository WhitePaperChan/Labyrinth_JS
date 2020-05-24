const mysql = require("mysql2");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
 
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
 

const LabMySQL = require('lab-mysql/libGameMySQL');
const games = new LabMySQL; // USE games only for form strings in the class LabMySQL
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  database: "labth",
  password: ""
});
 
const Labth = require('lab-labth/libLabth');
const LabPlayer = require('lab-player/libLabPlayer');
const Turn = require('lab-turn/Turn');
//const LabPlayer = require('lab-player/libLabPlayer');
 
// empty request
app.get("/", function(req, res){
	var query = "SELECT id, initiator, started FROM games WHERE `new_game` = true ORDER BY started DESC";
    pool.query(query, function(err, data) {
      if(err) return console.log(err);
        //var arr = JSON.parse(JSON.stringify(data));
        res.send(
        	games.gamesToJoinForm(
        		JSON.parse(JSON.stringify(data))));
    });
});
// post request 
app.post("/", urlencodedParser, function (req, res) {
	if(!req.body) return res.sendStatus(400);
				//console.log(JSON.parse(JSON.stringify(req.body)));
	arrForm = JSON.parse(JSON.stringify(req.body));
	if ('New' in arrForm){
		res.send(games.newGameForm);
	} else if ('Join' in arrForm){
		res.send(
        	games.joinGameForm.replace(
        			'value="game_id',
        			'value="' + req.body.Join.substring(10)));
	} else if ('NewPlayer' in arrForm){
		var db = new LabMySQL(pool);
		var game_id = req.body.game_id;
		db.mysql_get_game(game_id).then(function(obj){ //, new_game, max_player_no, curr_player
			var new_game = obj.new_game;
			var max_player_no = obj.max_player_no;
			var curr_player = obj.curr_player;
			//lab = obj.lab;
			var lab = new Labth;
			lab.map = obj.lab.map;
			lab.holes = obj.lab.holes;
			lab.booms = obj.lab.booms;
			//if (lab.showMap){ lab.labPrint(); }
			//players_max_no = db.mysql_get_players_max_no(game_id); // not needed? use max_player_no
			var land = lab.landFill();
			var landSelected = [];
			if (lab.randomCellGet( { land, landSelected } )){
				var player = new LabPlayer(req.body.nickname);
				player.moveTo(landSelected["x"], landSelected["y"]);
			}

			var player_no = max_player_no + 1; // players_max_no + 1;
			db.mysql_insert_player(player, player_no, game_id);
			db.mysql_update_game_player_no_max_no(game_id, (player_no + 1), player_no);
			//var turns_max_no = db.mysql_get_turns_max_no(game_id); // not needed
			var turns_max_no = player_no -1;
			db.mysql_get_last_turns_table(game_id).then(function(lastTurns){
				var currTurn = new Turn;
				currTurn.landing(player.name, turns_max_no + 1);
				db.mysql_insert_turn(currTurn, game_id);
				var s = 'You are in the game!<br />';
				//if (lab.showMap){ player.positionPrint(); }
				s += player.inventoryPrint();
				if (new_game){
					s += games.form_lab_refresh.replace(
									        			'value="game_id',
									        			'value="' + game_id
									        			).replace(
									        			'value="player_no',
									        			'value="' + player_no
									        			);
				} else {
					s += games.form_turn_buttons.replace(
							        			'value="game_id',
							        			'value="' + game_id
							        			);
				}
				s += "<br />"+currTurn.toStr(); 
				s += lastTurns;
				//s += db.lastTurnsPrint(turnResult);
				res.send(s);
			}).catch(function(err){ throw err; });
		}).catch(function(err){ throw err; });
	} else if ('Generate' in arrForm){
		var lab = new Labth;
		lab.labGenerate(req.body.Xmax, req.body.Ymax, 
						req.body.minRiverLengthIndex, req.body.maxRiverLengthIndex, 
						req.body.allThingsTogether, req.body.showMap);
		var land = lab.landFill();
		var landSelected = [];
		var obj = {land, landSelected};
		if (lab.randomCellGet(obj)){
			landSelected = obj.landSelected;
			land = obj.land;
			var player = new LabPlayer(req.body.nickname);
			player.moveTo(landSelected["x"], landSelected["y"]);
			
			var  db = new LabMySQL(pool);
			var player_no = 1; // game creator is no 1 // this var needed for form
			var currTurn = new Turn;
			currTurn.landing(player.name, 0); // 0 only for creator
			db.mysql_insert_game(lab, req.body.nickname).then(function(game_id){
				db.mysql_insert_player(player, player_no, game_id);
				db.mysql_insert_turn(currTurn, game_id);
				s = player.inventoryPrint() + "<br />";
				s += games.form_lab_start_game.replace(
	        			'value="game_id',
	        			'value="' + game_id
	        			).replace(
	        			'value="player_no',
	        			'value="' + player_no
	        			);
				s += "<br />" + currTurn.toStr();
				res.send(s);
			}).catch(function(err){ throw err; });
		} else {
			console.log("No land to put the player.");
		}
	} else if ('Refresh' in arrForm){
		db = new LabMySQL(pool);
		db.status_refresh(req.body.game_id, req.body.player_no, 'Refresh').then(function(page){
			res.send(page);
		}).catch(function(err){ throw err; });
	} else if ('Start' in arrForm){
		var game_id = req.body.game_id;
		var player_no = req.body.player_no;
		var s = '';
		var db = new LabMySQL(pool);
		db.mysql_update_game_on_start(game_id, player_no);
		
		//var obj = db.mysql_get_game(req.body.game_id); //, new_game, max_player_no, curr_player // not needed
		db.mysql_get_player(req.body.game_id, req.body.player_no).then(function(obj){
			var player = new LabPlayer("");
			player.name = obj.name;
			player.tnt = obj.tnt;
			player.cement = obj.cement;
			player.bullet = obj.bullet;
			player.forfeit = obj.forfeit;
			player.treasures = obj.treasures;
			
			//if (lab.showMap){ lab.labPrint(); }
			s += games.form_turn_buttons.replace(
									        			'value="game_id',
									        			'value="' + game_id
									        			).replace(
									        			'value="player_no',
									        			'value="' + player_no
									        			);
			//if (lab.showMap){ player.positionPrint(); }
			s += player.inventoryPrint();
			db.mysql_get_last_turns_table(req.body.game_id).then(function(lastTurns){
				s += lastTurns;
				res.send(s);
			}).catch(function(err){ throw err; });
		}).catch(function(err){ throw err; });
	} else {
		var db = new LabMySQL(pool);
		var game_id = req.body.game_id;
		var player_no = req.body.player_no;
		db.mysql_get_game(game_id).then(function(obj){ //, new_game, max_player_no, curr_player
			var new_game = obj.new_game;
			var max_player_no = obj.max_player_no;
			var curr_player = obj.curr_player;
			var lab = new Labth;
			lab.map = obj.lab.map;
			lab.holes = obj.lab.holes;
			lab.booms = obj.lab.booms;
			if (curr_player == player_no){
				db.mysql_get_player(req.body.game_id, req.body.player_no).then(function(obj){
					var player = new LabPlayer("");
					player.x = obj.x;
					player.y = obj.y;
					player.name = obj.name;
					player.tnt = obj.tnt;
					player.cement = obj.cement;
					player.bullet = obj.bullet;
					player.forfeit = obj.forfeit;
					player.treasures = obj.treasures;

					db.mysql_get_last_turn(game_id).then(function(lastDBturn){
						var currTurn = new Turn;
						currTurn.no = lastDBturn.no;
						currTurn.noSubturn = lastDBturn.noSubturn;
						currTurn.finished = lastDBturn.finished;
						currTurn.playerName = lastDBturn.playerName;
						currTurn.subturns = lastDBturn.subturns;
						
						if (currTurn.finished){
							lastTurnStr = currTurn.toStr();
							newTurn = true;
							currTurn.no++;
							currTurn.playerName = player.name;
							currTurn.noSubturn = 1;
							currTurn.subturns = [];
						} else {
							lastTurnStr = "";
							newTurn = false;
							currTurn.noSubturn++;
						}
						console.log(currTurn);
						turnActin = req.body.action;
						
						if (typeof req.body.North !== 'undefined'){
							var direction = 'North';
						} else if (typeof req.body.South !== 'undefined'){
							var direction = 'South';
						} else if (typeof req.body.West !== 'undefined'){
							var direction = 'West';
						} else if (typeof req.body.East !== 'undefined'){
							var direction = 'East';
						} else if (typeof req.body.Center !== 'undefined'){
							var direction = 'Center';
						}
						currTurn = lab.turnLabReaction(turnActin, direction, player, currTurn);
						//if (lab.showMap){ lab.labPrint(); }
						
						db.mysql_update_game_curr_player(
								lab, game_id, player_no, max_player_no, curr_player, currTurn.finished);
						db.mysql_update_player(player, player_no, game_id);
						db.mysql_insert_update_turn(currTurn, newTurn, game_id);
						
						var s = '';
						s += games.form_turn_buttons.replace(
									        			'value="game_id',
									        			'value="' + game_id
									        			).replace(
									        			'value="player_no',
									        			'value="' + player_no
									        			);
						//if (lab.showMap){ player.positionPrint(); }
						s += player.inventoryPrint();
						//player.inventoryPrint();
						s += "<br>\n"+currTurn.toStr(); 
						s += lastTurnStr;
						db.mysql_get_last_turns_table(req.body.game_id).then(function(lastTurns){
							s += lastTurns;
							res.send(s);
						}).catch(function(err){ throw err; });
					}).catch(function(err){ throw err; });
				}).catch(function(err){ throw err; });
			} else {
				/*var game_id = req.body.game_id;
				var player_no = req.body.player_no;*/
				db = new LabMySQL(pool);
				db.status_refresh(game_id, player_no, 'Not your turn').then(function(s){
					res.send(s);
				}).catch(function(err){ throw err; });
			}
		}).catch(function(err){ throw err; });
	}
	
});
 
app.listen(3000, function(){
  console.log("Ready for request ...");
});

