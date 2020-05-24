module.exports = class LabMySQL {
	Labth = require('lab-labth/libLabth');
	//game_id = 0;
	pool;
	last_turns_no = 5;
	
	newGameForm = `
<form method=post>
<table>
<tr>
	<td><b>Your nickname:</b></td>
	<td><input type="text" name="nickname" size=10 value=""></td>
</tr>
<tr>
	<td><b>Xmax:</b></td>
	<td><input type="text" name="Xmax" size=10 value="5"></td>
</tr>
<tr>
	<td><b>Ymax:</b></td>
	<td><input type="text" name="Ymax" size=10 value="5"></td>
</tr>
<tr>
	<td><b>minRiverLengthIndex:</b></td>
	<td><input type="text" name="minRiverLengthIndex" size=10 value="5"></td>
</tr>
<tr>
	<td><b>maxRiverLengthIndex:</b></td>
	<td><input type="text" name="maxRiverLengthIndex" size=10 value="3"></td>
</tr>
<tr>
	<td><b>allThingsTogether:</b></td>
	<td><input type="checkbox" name="allThingsTogether"></td>
</tr>
<!-- <tr>
	<td><b>showMap:</b></td>
	<td><input type="checkbox" name="showMap"></td>
</tr> -->
<tr><td colspan=2>
<input id = "GenerateButton" type="submit" name="Generate" value="Generate">
</td></tr>
</table>
</form>
`;
	
	joinGameForm = `
<form method=post>
<input type="hidden" name="game_id" value="game_id">
<table>
<tr>
	<td><b>Your nickname:</b></td>
	<td><input type="text" name="nickname" size=10 value=""></td>
</tr>
<tr><td colspan=2>
<input  type="submit" name="NewPlayer" value="Join the game">
</td></tr>
</table>
</form>
`;
	
	form_lab_start_game = `
<form method=post>
	<input type="hidden" name="game_id" value="game_id">
	<input type="hidden" name="player_no" value="player_no">
	<input type="submit" name="Refresh" value="Refresh">
	<input type="submit" name="Start" value="Start the game">
</form>
`;

	form_lab_refresh = `
<form method=post>
	<input type="hidden" name="game_id" value="game_id">
	<input type="hidden" name="player_no" value="player_no">
	<input type="submit" name="Refresh" value="Refresh">
</form>
	`;
	
	form_turn_buttons = `
<form method=post>
	<input type="hidden" name="game_id" value="game_id">
	<input type="hidden" name="player_no" value="player_no">
<table>
<tr>
	<td>
<input type="radio" id="bum" name="action" value="bum" title="Bum"><label for="bum">B</label>
	</td><td>
<input class="turnButton" id="North-submit" type="submit" name="North" value="&uarr;">
	</td><td>
<input type="radio" id="shoot" name="action" value="shoot" title="Shoot"><label for="shoot">S</label>
	</td>
</tr>
<tr>
	<td>
<input class="turnButton" id="West-submit" type="submit" name="West" value="&larr;">
	</td><td>
<input class="turnButton" id="center-submit" type="submit" name="Center" value="&#9931;">
	</td><td>
<input class="turnButton" id="East-submit" type="submit" name="East" value="&rarr;">
	</td>
</tr>
<tr>
	<td>
<input type="radio" id="cement" name="action" value="cement" title="cement"><label for="Cement">C</label>
	</td><td>
<input class="turnButton" id="South-submit" type="submit" name="South" value="&darr;">
	</td><td>
<input type="radio" id="move" name="action" value="move" title="Move" checked="checked"><label for="move">M</label>
	</td>
</tr>
<tr>
	<td colspan=3>
<input type="submit" name="Refresh" value="Refresh">
	</td>
</tr>
</table>
</form>
	`;


	constructor(pool) {
		this.pool = pool;
	}

/* games */
	gamesToJoinForm(arr){//
		var resForm = '<form method=post><input type="submit" name="New" value="New game">';
        resForm += '<table>'
		resForm += '<tr>';
		resForm += '<th>id<th>';
		resForm += '<th>initiator<th>';
		resForm += '<th>started<th>';
		resForm += '</tr>';
        for (let row of arr){
			resForm += '<tr>';
			resForm += '<td>' + row.id + '<td>';
			resForm += '<td>' + row.initiator + '<td>';
			resForm += '<td>' + row.started + '<td>';
			resForm += '<input class="JoinButton" type="submit" name="Join" value="Join game ' + row.id + '">';
			resForm += '</tr>';
    	}
		resForm += '</table></form>';
		return resForm;
	}

	/* insert to DB and return game id */
	mysql_insert_game(lab, initiator){ 
		var pool = this.pool;
		return new Promise(function(resolve, reject){
			var lab_serialized = JSON.stringify(lab).replace('"', '~');
			var query  = "INSERT games SET `new_game` = true, `finished_game` = false, `labth` = '"+lab_serialized
				+"', `max_player_no` = '1', `curr_player` = 1, `initiator` = '"+initiator
				+"'";
			pool.query(query, function(err, result) {
				if (err) return reject(err);
				resolve(result.insertId);
			});
		});	
	}

	mysql_get_game(game_id){//, &new_game, &max_player_no, &curr_player
		console.log(game_id);
		var pool = this.pool;
		return new Promise(function(resolve, reject){
			var query = "SELECT labth, new_game, curr_player, max_player_no FROM games WHERE `id`='" + game_id + "'";
			pool.query(query, function(err, result) {
				if (err) return reject(err);
				var row = JSON.parse(JSON.stringify(result));
				var new_game = row[0].new_game; 
				var max_player_no = row[0].max_player_no; 
				var curr_player = row[0].curr_player; 
				var lab_json = row[0].labth; 
				var lab = JSON.parse(lab_json.replace('~', '"')); 
				resolve({ new_game, max_player_no, curr_player, lab });
	    	});
	    });
	}

	mysql_update_game_on_start(game_id, player_no){
		var query  = "UPDATE games SET `new_game` = false, `curr_player` = '" + player_no
			 + "' WHERE `id`='" + game_id + "'";
		this.pool.query(query, function(err, data) {
			if (err) throw err;
		});
	}

	mysql_update_game_curr_player(lab, game_id, player_no, max_player_no, curr_player, finished){
		//mysqli = this.connect_my_db(this.host, this.user, this.password, this.data_base);
		if (player_no == max_player_no){
			curr_player = 1;
		} else {
			curr_player++;
		}
		if (finished){ // currTurn.finished
			var curr_player_str = "', `curr_player`='" + curr_player;
		} else {
			var curr_player_str = "";
		}
		//lab_json = str_replace('"', '~', serialize(lab));
		var lab_json = JSON.stringify(lab).replace('"', '~');
		var query  = "UPDATE games SET `labth` = '" + lab_json
			 + curr_player_str
			 + "' WHERE `id`='" + game_id
			 + "'";
		//if (!result = mysqli.query(query)) {echo "Error table " + mysqli.errno + " " + mysqli.error; /*exit;*/}
		this.pool.query(query, function(err, data) {
			if (err) throw err;
		});
	}

	mysql_update_game_player_no_max_no(game_id, curr_player, max_player_no){
		var query  = "UPDATE games SET `curr_player` = '" + curr_player    // (player_no + 1) when Join player
			 + "', `max_player_no` = '" + max_player_no // player_no when Join player
			 + "' WHERE `id`='" + game_id
			 + "'";
		this.pool.query(query, function(err, data) {
			if (err) throw err;
		});
	}


/* players */
	mysql_insert_player(player, player_no, game_id){
		var player_serialized = JSON.stringify(player).replace('"', '~');
		var query  = "INSERT game_players SET `game` = '"+game_id
			+"', `no` = '"+player_no
			+"', `obj` = '"+player_serialized+"'";
		this.pool.query(query, function(err, result) {
			if (err) throw err;
		});
	}

	mysql_update_player(player, player_no, game_id){
		//mysqli = this.connect_my_db(this.host, this.user, this.password, this.data_base);
		var player_serialized = JSON.stringify(player).replace('"', '~');
		var query  = "UPDATE game_players SET `obj` = '" + player_serialized
			 + "' WHERE `game`='" + game_id
			 + "' AND `no` = '" + player_no
			 + "'";
		this.pool.query(query, function(err, result) {
			if (err) throw err;
		});
	}

	mysql_get_player(game_id, player_no){
		var pool = this.pool;
		return new Promise(function(resolve, reject){
			var query = "SELECT obj FROM game_players WHERE `game`='" + game_id + "' AND `no`='" + player_no + "'";
			pool.query(query, function(err, result) {
				if (err) return reject(err);
				var row = JSON.parse(JSON.stringify(result));
				var player = JSON.parse(row[0].obj.replace('~', '"')); 
				resolve(player);
			});
		});
	}


/* turns */
	mysql_insert_turn(currTurn, game_id){
		var currTurn_serialized = JSON.stringify(currTurn).replace('"', '~'); 
		var query  = "INSERT game_turns SET `game` = '"+game_id
			+"', `no` = '"+currTurn.no
			+"', `obj` = '"+currTurn_serialized+"'";
		this.pool.query(query, function(err, result) {
			if (err) throw err;
		});
	}

	mysql_insert_update_turn(currTurn, newTurn, game_id){
		var currTurn_serialized = JSON.stringify(currTurn).replace('"', '~'); 
		if (newTurn){
			var query  = "INSERT game_turns SET `game` = '" + game_id
				 + "', `no` = '" + currTurn.no
				 + "', `obj` = '" + currTurn_serialized
				 + "'";
		} else {
			var query  = "UPDATE game_turns SET `obj` = '" + currTurn_serialized
				 + "' WHERE `game`='" + game_id
				 + "' AND `no` = '" + currTurn.no
				 + "'";
		}
		this.pool.query(query, function(err, result) {
			if (err) throw err;
		});
	}

	mysql_get_last_turn(game_id){
		var pool = this.pool;
		return new Promise(function(resolve, reject){
			var query = "SELECT obj FROM game_turns WHERE `game`='" 
						+ game_id + "' ORDER BY no DESC LIMIT 1"; 
			pool.query(query, function(err, result) {
				if (err) return reject(err);
				//return result;
				var str = '';
				var arr = JSON.parse(JSON.stringify(result));
				var currTurn = JSON.parse(arr[0].obj.replace('~', '"')); 
				resolve(currTurn);
			});
		});
	}

	mysql_get_last_turns_table(game_id){
		var pool = this.pool;
		return new Promise(function(resolve, reject){
			var query = "SELECT obj FROM game_turns WHERE `game`='" 
						+ game_id + "' ORDER BY no DESC LIMIT 5"; 
			pool.query(query, function(err, result) {
				if (err) return reject(err);
				//return result;
				var str = '';
				var arr = JSON.parse(JSON.stringify(result));
				arr.forEach(function(row) {
					var currTurn = JSON.parse(row.obj.replace('~', '"')); 
					var no = currTurn.no;
					str += no+". "+currTurn.playerName+"<br>\n";
					if (currTurn.subturns.length > 0){
						currTurn.subturns.forEach(function(value) {
							str +=  no+"."+value["noSubturn"]+". "+value["reaction"]+"<br>\n";
							str +=  value["answer"]+"<br>\n";
						});
					}
					str +=  "<br>\n";
				});
				resolve(str);
			});
		});
	}

	status_refresh(game_id, player_no, request_answer){
		var answer = [];
		var db = this;
		return new Promise(function(resolve, reject){
			db.mysql_get_game(game_id).then(function(obj){ //, new_game, max_player_no, curr_player
				var new_game = obj.new_game;
				var max_player_no = obj.max_player_no;
				var curr_player = obj.curr_player;
				//lab = obj.lab;
				var Labth = require('lab-labth/libLabth');
				var lab = new Labth;
				lab.map = obj.lab.map;
				lab.holes = obj.lab.holes;
				lab.booms = obj.lab.booms;
				//var player = this.mysql_get_player(game_id, player_no);
				db.mysql_get_player(game_id, player_no).then(function(obj){
					var LabPlayer = require('lab-player/libLabPlayer');
					var player = new LabPlayer("");
					player.name = obj.name;
					player.tnt = obj.tnt;
					player.cement = obj.cement;
					player.bullet = obj.bullet;
					player.forfeit = obj.forfeit;
					player.treasures = obj.treasures;
					//var turnResult = this.mysql_get_last_turns_table(game_id);
			
					var s = '';
					//if (lab.showMap){ lab.labPrint(); }
					if (new_game){ // must be commented! use only for debugging
						if (player_no == 1){
							s += db.form_lab_start_game.replace(
									        			'value="game_id',
									        			'value="' + game_id
									        			).replace(
									        			'value="player_no',
									        			'value="' + player_no
									        			);
						} else {
							s += db.form_lab_refresh.replace(
									        			'value="game_id',
									        			'value="' + game_id
									        			).replace(
									        			'value="player_no',
									        			'value="' + player_no
									        			);
						}
					} else {
						s += db.form_turn_buttons.replace(
									        			'value="game_id',
									        			'value="' + game_id
									        			).replace(
									        			'value="player_no',
									        			'value="' + player_no
									        			);
					}
					//if (lab.showMap){ player.positionPrint(); }
					s =  request_answer + s + "<br />" + player.inventoryPrint();
					/*s += this.lastTurnsPrint(turnResult);
					return s; */
					db.mysql_get_last_turns_table(game_id).then(function(lastTurns){
						s += lastTurns;
						resolve(s);
					}).catch(function(err){ throw err; });
				}).catch(function(err){ throw err; });
			}).catch(function(err){ throw err; });
		});
	}
	
	// in prev function
	/*lastTurnsPrint(turnResult){ // turnResult - db result table
		var str = '';
		turnResult.forEach(function(row) {
			var currTurn = JSON.parse(row.obj.replace('~', '"')); 
			var no = currTurn.no;
			str += no+"+ "+currTurn.playerName+"<br>\n";
			if (currTurn.subturns.length > 0){
				currTurn.subturns.forEach(function(value) {
					str +=  no+"."+value["noSubturn"]+". "+value["reaction"]+"<br>\n";
					str +=  value["answer"]+"<br>\n";
				});
			}
			str +=  "<br>\n";
		});
		return str;
	}*/ 

};
