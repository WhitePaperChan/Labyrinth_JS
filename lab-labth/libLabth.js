module.exports = class Labth {
	Xmax = 5;
	Ymax = 5;
	minRiverLengthIndex = 5;
	maxRiverLengthIndex = 3;
	minRiverLength;
	maxRiverLength;
	allThingsTogether = false;
	showMap = false;
	map = [];
	holes = [];
	booms = [];

	random_int(min, max) {
    	return Math.floor(Math.random() * (max - min + 1) ) + min;
	}

	noCellTypeFill(cellType) {
		var land = [];
		for (let i=1; i<=this.Xmax; i++){
			for (let j=1; j<=this.Ymax; j++){
				var x = i*2-1;
				var y = j*2-1;
				if (this.map[y][x][cellType] == 0){
					land.push({"x" : x, "y" : y});
				}
			}
		}
		return land;
	}
	landFill() {
		var land = [];
		for (let i=1; i<=this.Xmax; i++){
			for (let j=1; j<=this.Ymax; j++){
				var x = i*2-1;
				var y = j*2-1;
				if (this.map[y][x]["hole"] == 0 && this.map[y][x]["river"] == 0 && this.map[y][x]["bum"] == 0){
					land.push({"x" : x, "y" : y});
				}
			}
		}
		return land;
	}
	randomCellGet(obj) {
		var land = obj[0]; var landSelected = obj[1];
		if (obj.land.length > 0){
			var landNo = this.random_int(0, obj.land.length-1);
			obj.landSelected = obj.land[landNo];
			obj.land.splice(landNo, 1);
			return true;
		} else {
			return false;
		}
	}


	/* lab0Generate */
	wallLineGenerate() {
		var wallLine = [0];
		for (let i = 1; i < this.Xmax*2+1; i += 2) {
			wallLine.push(0, 0);
		}
		return wallLine;
	}
	cellLineGenerate() {
		var cellLine = [0];
		for (let i = 1; i < this.Xmax*2+1; i += 2) {
			cellLine.push({hole : 0, "river" : 0, "bum" : 0}, 0);
		}
		return cellLine;
	}
	lab0Generate() {
		this.map.push(this.wallLineGenerate());
		for (let i = 1; i < this.Ymax*2+1; i += 2) {
			this.map.push(this.cellLineGenerate());
			this.map.push(this.wallLineGenerate());
		}
	}

	markExternalWalls() {
		for (let i = 0; i < this.Xmax*2+1; i++) {
		 	this.map[0][i] = 999;
		}
		for (let i = 1; i < this.Ymax*2+1; i += 2) {
		 	this.map[i][0] = 999; 
		 	this.map[i][this.Xmax*2] = 999;
			for (let j = 0; j < this.Xmax*2+1; j += 2) {
			 	this.map[i+1][j] = 999;
			}
		}
		for (let i = 0; i < this.Xmax*2+1; i++) {
			let y = this.Ymax*2;
		 	this.map[y][i] = 999;
		}
	}
	labExitGenerate() {
		var side = this.random_int(1, 4);
		if (side == 1) {
			this.map[0][this.random_int(1, this.Xmax)*2-1] = 0;
		} else if (side == 2) {
			this.map[this.Ymax*2][this.random_int(1, this.Xmax)*2-1] = 0;
		} else if (side == 3) {
			this.map[this.random_int(1, this.Ymax)*2-1][0] = 0;
		} else if (side == 4) {
			this.map[this.random_int(1, this.Ymax)*2-1][this.Xmax*2] = 0;
		}
	}

	/* labRiverGenerate */
	riverSource(source) {
		var side = this.random_int(1, 4);
		if (side == 1) {
			source.Y = 1; source.X = this.random_int(1, this.Xmax);
		} else if (side == 2) {
			source.Y = this.Ymax; source.X = this.random_int(1, this.Xmax);
		} else if (side == 3) {
			source.Y = this.random_int(1, this.Ymax); source.X = 1;
		} else if (side == 4) {
			source.Y = this.random_int(1, this.Ymax); source.X = this.Xmax;
		}
	}
	
	findAvailableRiverDirections(source) {
				var availableDirections = [];
				if (source.X > 1 && this.map[source.Y*2-1][source.X*2-3]["river"] == 0) {
					availableDirections.push(1);
				} 
				if (source.Y > 1 && this.map[source.Y*2-3][source.X*2-1]["river"] == 0) {
					availableDirections.push(2);
				} 
				if (source.X < this.Xmax && this.map[source.Y*2-1][source.X*2+1]["river"] == 0) {
					availableDirections.push(3);
				} 
				if (source.Y == this.Ymax && this.map[source.Y*2+1][source.X*2-1]["river"] == 0) {
					availableDirections.push(4);
				}
				return availableDirections;
	}
	
	riverDirectionGenerate(source) {
				var availableDirections = this.findAvailableRiverDirections(source);
				var numberOfAvailableDirection = availableDirections.length;
				if (numberOfAvailableDirection == 0){
					// Lake
					this.map[source.Y*2-1][source.X*2-1]["river"] = 5; //2do 5 is a constant for Lake
				} else {
					this.map[source.Y*2-1][source.X*2-1]["river"] = 
						availableDirections[this.random_int(1, numberOfAvailableDirection)];
				}
	}/**/
	
	labRiverGenerate() {
		var source = { Y : 1, X : 1 };
		this.riverSource(source);
		var direction = this.random_int(1, 4);
		var riverCellNumber = 1; // river lenth counter
		// if river is not so long not direct it to out
		for (let inf = 1; inf <= 99999; inf++) {  // 2do may be better way // while (true) is a not good idea for web server
			if (riverCellNumber >= this.maxRiverLength){
				this.map[source.Y*2-1][source.X*2-1]["river"] = 5; //Lake // 2do const Lake
				break;
			}
			if (direction == 1 && source.X == 1) {
				if (riverCellNumber >= this.minRiverLength){
					this.map[source.Y*2-1][source.X*2-1]["river"] = direction;
					break;
				} else {
					direction = this.random_int(1, 4);
					continue;
				}
			} else if (direction == 2 && source.Y == 1) {
				if (riverCellNumber >= this.minRiverLength){
					this.map[source.Y*2-1][source.X*2-1]["river"] = direction;
					break;
				} else {
					direction = this.random_int(1, 4);
					continue;
				}
			} else if (direction == 3 && source.X == this.Xmax) {
				if (riverCellNumber >= this.minRiverLength){
					this.map[source.Y*2-1][source.X*2-1]["river"] = direction;
					break;
				} else {
					direction = this.random_int(1, 4);
					continue;
				}
			} else if (direction == 4 && source.Y == this.Ymax) {
				if (riverCellNumber >= this.minRiverLength){
					this.map[source.Y*2-1][source.X*2-1]["river"] = direction;
					break;
				} else {
					direction = this.random_int(1, 4);
					continue;
				}
			}
			if (direction == 1 && this.map[source.Y*2-1][source.X*2-3]["river"] >0) {
				this.riverDirectionGenerate(source);
			} else if (direction == 2 && this.map[source.Y*2-3][source.X*2-1]["river"] >0) {
				this.riverDirectionGenerate(source);
			} else if (direction == 3 && this.map[source.Y*2-1][source.X*2+1]["river"] >0) {
				this.riverDirectionGenerate(source);
			} else if (direction == 4 && this.map[source.Y*2+1][source.X*2-1]["river"] >0) {
				this.riverDirectionGenerate(source);
			} else {
				this.map[source.Y*2-1][source.X*2-1]["river"] = direction;
			riverCellNumber++;
			}
			direction = this.map[source.Y*2-1][source.X*2-1]["river"];
			if (direction == 1) {
				source.X--;
			} else if (direction == 2) {
				source.Y--;
			} else if (direction == 3) {
				source.X++;
			} else if (direction == 4) {
				source.Y++;
			}
			direction = this.random_int(1, 4);
		}
		if (this.map[source.Y*2-1][source.X*2-1]["river"] == 0){
			this.map[source.Y*2-1][source.X*2-1]["river"] = 5; // Lake // We need it for the case when the cycle ended and did not find the direction of the river
		}
	}
	
	labHoleBumGenerate(cellType) { /* cellType = "hole" or "bum" */
		var land;
		if (this.allThingsTogether){
			land = this.noCellTypeFill(cellType);
		} else {
			land = this.landFill();
		}
		for (let i = 1; i <=4; i++){ // 2do // constant 4 - no of hols in a cycle or bum objects
			var landSelected = [];
			var obj = {land, landSelected};
			if (this.randomCellGet(obj)){
				landSelected = obj.landSelected;
				land = obj.land;
				this.map[landSelected["y"]][landSelected["x"]][cellType] = i;
				if (cellType == "hole"){
					this.holes[i] = {"x" : landSelected["x"], "y" : landSelected["y"]};
				} else { // "bum"
					this.booms[i] = {"x" : landSelected["x"], "y" : landSelected["y"]};
				}
			} else {
				console.log( "No Cell to place object "+cellType+"<br />"); 
			}
		}
	}
	
	labGenerate(Xmax, Ymax, minRiverLengthIndex, maxRiverLengthIndex, allThingsTogether, showMap) {
		this.Xmax = Xmax;
		this.Ymax = Ymax;
		this.minRiverLengthIndex = minRiverLengthIndex;
		this.maxRiverLengthIndex = maxRiverLengthIndex;
		this.allThingsTogether = allThingsTogether;
		this.showMap = showMap;
		
		this.lab0Generate();
		this.markExternalWalls();
		this.labExitGenerate();
		//this.labRiverGenerate();
		this.labHoleBumGenerate("hole");
		this.labHoleBumGenerate("bum");/**/
	}

		/*
		labReaction
		*/
		
	isWall(direction, player) {
		if (direction == 'North'){
			if (this.map[player.y-1][player.x] == 0){
				return false;
			}
		} else if (direction == 'South'){
			if (this.map[player.y+1][player.x] == 0){
				return false;
			}
		} else if (direction == 'West'){
			if (this.map[player.y][player.x-1] == 0){
				return false;
			}
		} else if (direction == 'East'){
			if (this.map[player.y][player.x+1] == 0){
				return false;
			}
		}
		return true;
	}
	makeWall(direction, player) {
		if (direction == 'North'){
			this.map[player.y-1][player.x]++;
		} else if (direction == 'South'){
			this.map[player.y+1][player.x]++;
		} else if (direction == 'West'){
			this.map[player.y][player.x-1]++;
		} else if (direction == 'East'){
			this.map[player.y][player.x+1]++;
		}
		return true;
	}
	explodeWall(direction, player) {
		if (direction == 'North'){
			if (this.map[player.y-1][player.x] > 0){
				this.map[player.y-1][player.x]--;
				return true;
			} else {
				return false;
			}
		} else if (direction == 'South'){
			if (this.map[player.y+1][player.x] > 0){
				this.map[player.y+1][player.x]--;
				return true;
			} else {
				return false;
			}
		} else if (direction == 'West'){
			if (this.map[player.y][player.x-1] > 0){
				this.map[player.y][player.x-1]--;
				return true;
			} else {
				return false;
			}
		} else if (direction == 'East'){
			if (this.map[player.y][player.x+1] > 0){
				this.map[player.y][player.x+1]--;
				return true;
			} else {
				return false;
			}
		}
		return true;
	}
	turnHoleMoveReaction(direction, player, turn) {
		turn.noSubturn++;
		var answer = "";
		var cellBum = "";
		var cellType = "";
		var cellHole = "";
		var holeNo = this.map[player.y][player.x]["hole"];
		if (holeNo >= 4){ // 2do const holes in a cycle
			player.moveTo(this.holes[1]['x'], this.holes[1]['y']);
		} else{
			player.moveTo(this.holes[holeNo+1]['x'], this.holes[holeNo+1]['y']);
		}
		if (this.map[player.y][player.x]["bum"] > 0){
			cellBum = "-Boom";
			answer = "* You can blow it up *";
		} else {
			cellBum = "";
		}
		if (this.map[player.y][player.x]["river"] > 0){
			cellType = "River";
			answer = "~ ~ ~";
		} else {
			cellType = "Land";
			answer = "...";
		}
		if (this.map[player.y][player.x]["hole"] > 0){
			cellHole = "-Hole";
			answer = ". O .";
		} else {
			cellHole = "";
		}
		turn.subturns.push(
			{"noSubturn" : turn.noSubturn, 
				"reaction" : "hole move: " + cellType + cellHole + cellBum + "", // 2do "hole move" to translate constant
				"answer" : answer
			}
		);
	}
	/*turnRiverMoveReaction(direction, player, turn) {
		turn.noSubturn++;
		answer = "";
		direction = this.map[player.y][player.x]["river"];
		if (direction == 1) {
			if (this.map[player.y][player.x-1] == 0){
				player.x -= 2;
			}
		} else if (direction == 2) {
			if (this.map[player.y-1][player.x] == 0){
				player.y -= 2;
			}
		} else if (direction == 3) {
			if (this.map[player.y][player.x+1] == 0){
				player.x += 2;
			}
		} else if (direction == 4) {
			if (this.map[player.y+1][player.x] == 0){
				player.y += 2;
			}
		//} else if (direction == 5) { // not needed
		}
		// 2do to functions
		if (this.map[player.y][player.x]["bum"] > 0){
			cellBum = "-Bum";
			answer = "* You can blow it up *";
		} else {
			cellBum = "";
		}
		if (this.map[player.y][player.x]["river"] > 0){
			cellType = "River";
			answer = "~ ~ ~";
		} else {
			cellType = "Land";
			answer = "...";
		}
		if (this.map[player.y][player.x]["hole"] > 0){
			cellHole = "-Hole";
			answer = ". O .";
		} else {
			cellHole = "";
		}
		array_push(turn.subturns, 
			{"noSubturn" : turn.noSubturn, 
				"reaction" : "river move: " + cellType + cellHole + cellBum + "", // 2do "hole move" to translate constant
				"answer" : answer
			}
		);
		if (this.map[player.y][player.x]["hole"] > 0){
			this.turnHoleMoveReaction(direction, player, turn);
		}
	}*/

	turnMoveReaction(turnActin, direction, player, turn) {
		var answer = "";
		var cellBum = "";
		var cellType = "";
		var cellHole = "";
		if (direction == 'Center'){
			answer += "Running on the spot is good idea, but not in this case. Try again.";
			turn.finished = false;
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Invalid move",
					"answer" : answer
				}
			);
		} else if (this.isWall(direction, player)){
			answer += "Wall, try again.";
			turn.finished = false;
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Wall",
					"answer" : answer
				}
			);
		} else {
			if (direction == 'North'){
				player.y -= 2;
			} else if (direction == 'South'){
				player.y += 2;
			} else if (direction == 'West'){
				player.x -= 2;
			} else if (direction == 'East'){
				player.x += 2;
			}
			if (player.y == -1 || player.x == -1 || player.y == this.Ymax*2+1 || player.x == this.Xmax*2+1){
			console.log(player.y);
				cellType = "Exit";
				answer = "";
				player.treasures.forEach(function(value){
			console.log(value);
					if (value == 3){ // 3 is Real treasure // may b 2do
						answer += "<br />You have got Real treasure! <br />YOU WIN!!!";
					} else {
						answer += "<br />You have got Fake treasure.";
					}
				});
				turn.subturns.push(
					{"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": " + cellType + cellHole + cellBum + "",
						"answer" : answer
					}
				);
				turn.finished = true;
			} else {
				answer = "";
				if (this.map[player.y][player.x]["bum"] > 0){
					cellBum = "-Boom";
					answer = "* You can blow it up *";
				} else {
					cellBum = "";
				}
				if (this.map[player.y][player.x]["river"] > 0){
					cellType = "River";
					answer = "~ River moves you ~";
				} else {
					cellType = "Land";
					answer = "...";
				}
				if (this.map[player.y][player.x]["hole"] > 0){
					cellHole = "-Hole";
					answer = "~ Hole moves you. ~";
				} else {
					cellHole = "";
				}
				turn.subturns.push(
					{"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": " + cellType + cellHole + cellBum + "",
						"answer" : answer
					}
				);
				if (this.map[player.y][player.x]["hole"] > 0){
					this.turnHoleMoveReaction(direction, player, turn);
				} else if (this.map[player.y][player.x]["river"] > 0){
					this.turnRiverMoveReaction(direction, player, turn);
				}
				turn.finished = true;
			}
		}
	}

	turnExplodeCell(turnActin, direction, player, turn) {
		if (this.map[player.y][player.x]["bum"] == 0){
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Invalid move",
					"answer" : "Blow yourself up is good idea, but not in this case. Try again."
				}
			);
			turn.finished = false;
		} else if (this.map[player.y][player.x]["bum"] == 1){ // hospital
			player.tnt--;
			player.incForfeit();
			for (key in player.treasures){
				x = this.booms[player.treasures[key]]["x"];
				y = this.booms[player.treasures[key]]["y"];
				this.map[y][x]["bum"] = player.treasures[key];
				player.treasures.splice(key, 1);
			};
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Hospital",
					"answer" : "Do not blow up hospitals! Lose a turn."
				}
			);
			turn.finished = true;
		} else if (this.map[player.y][player.x]["bum"] == 2){ //arsenal
			player.tnt--;
			player.getArsenal();
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Arsenal",
					"answer" : "You gain 3 tnt, 2 cement, 1 bullet"
				}
			);
			turn.finished = true;
		} else if (this.map[player.y][player.x]["bum"] > 2){ //treasure
			player.tnt--;
			var id = this.map[player.y][player.x]["bum"];
			this.map[player.y][player.x]["bum"] = 0;
			player.getTreasure(id);
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Treasure",
					"answer" : "TREASURE!"
				}
			);
			turn.finished = true;
		}
	}

	turnBumReaction(turnActin, direction, player, turn) {
		if (player.tnt <= 0){
			answer += "You have no enough TNT. Try again.";
			turn.finished = false;
			turn.subturns.push(
				{"noSubturn" : turn.noSubturn, 
					"reaction" : turnActin + " " + direction + ": Invalid move",
					"answer" : answer
				}
			);
		} else if (direction == 'Center'){
			this.turnExplodeCell(turnActin, direction, player, turn);
		} else{
			if (this.explodeWall(direction, player)){
				player.tnt--;
				turn.finished = true;
				turn.subturns.push(
					{"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": Broken wall.",
						"answer" : "The wall is blown up. You can go through if it was only one."
					}
				);
			} else {
				turn.finished = false;
				turn.subturns.push(
					{"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": Invalid move",
						"answer" : "No wall to blow up. Try again."
					}
				);
			}
		}
		//return answer;
	}

	turnLabReaction(turnActin, direction, player, turn) { // &turn
		var answer = "";
		if (turnActin == 'move'){
			answer = this.turnMoveReaction(turnActin, direction, player, turn);
		} else if (turnActin == 'bum'){
			answer = this.turnBumReaction(turnActin, direction, player, turn);
		} else if (turnActin == 'cement'){
			if (player.cement <= 0){
				answer  += "You have no enough cement. Try again.";
				turn.finished = false;
				turn.subturns.push(
					{
						"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": Invalid move",
						"answer" : answer
					}
				);
			} else if (direction == 'Center'){
				answer  += "Cement yourself is good idea, but not in this case. Try again.";
				turn.finished = false;
				turn.subturns.push(
					{
						"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": Invalid move",
						"answer" : answer
					}
				);
			} else if (this.makeWall(direction, player)){
				answer  += "Wall is added.";
				player.cement--;
				turn.finished = true;
				turn.subturns.push(
					{
						"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": new Wall",
						"answer" : answer
					}
				);
				// 2do if river move, if hole not
			}
		} else if (turnActin == 'shoot'){
			if (player.bullet <= 0){
				answer  += "You have no enough bullets. Try again.";
				turn.finished = false;
				turn.subturns.push(
					{
						"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": Invalid move",
						"answer" : answer
					}
				);
			} else if (direction == 'Center'){
				answer  += "Shoot yourself is good idea, but not in this case. Try again.";
				turn.finished = false;
				turn.subturns.push(
					{
						"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": Invalid move",
						"answer" : answer
					}
				);
			} else {
				//2do
				turn.finished = true;
				turn.subturns.push(
					{
						"noSubturn" : turn.noSubturn, 
						"reaction" : turnActin + " " + direction + ": 2do",
						"answer" : "2do"
					}
				);
			}
		}
		return turn;
	}

}