module.exports = class Turn {
	no = 0;
	noSubturn = 0;
	finished = false;
	playerName = "";
	subturns = []; /* "noSubturn", "reaction", "answer" */

	toStr(){
		var str = '';
		var no = this.no;
		str += no+"+ "+this.playerName+"<br>\n";
		if (this.subturns.length > 0){
			this.subturns.forEach(function(value) {
				str +=  no+"."+value["noSubturn"]+". "+value["reaction"]+"<br>\n";
				str +=  value["answer"]+"<br>\n";
			});
		}
		str +=  "<br>\n";
		return str;
	}
	landing(name, turnNo){
		this.no = turnNo;
		this.finished = true;
		this.playerName = name;
		this.subturns.push(
			{
				"noSubturn" : 0, // 0 only for landing
				"reaction" : " start: Land",
				"answer" : "..."
			}
		);
	}
	/* API */
	/*toArray(){
		turn = array("turn_no" : this.no, "player_name" : this.playerName);
		subturns = array();
		if (count(this.subturns) > 0){
			foreach (this.subturns as value) {
				subturns[] = array("subturn_no" : value["noSubturn"], "reaction" : value["reaction"], "answer" : value["answer"]);
			}
		}
		answer = array("turn" : turn, "subturns" : subturns);
		return answer;
	}*/
}
