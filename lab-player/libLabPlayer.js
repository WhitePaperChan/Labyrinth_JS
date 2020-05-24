module.exports = class LabPlayer {
	x = 0;
	y = 0;
	tnt = 3;
	cement = 2;
	bullet = 1;
	forfeit = 0;
	name = "Player";
	treasures = [];

	constructor(name) {
		this.name = name;
	}
	getArsenal(){
		this.tnt += 3;
		this.cement += 2;
		this.bullet += 1;
	}
	getTreasure(id){
		this.treasures.push(id);
	}
	incForfeit(){
		this.forfeit++;
	}
	moveTo(x, y){
		this.x = x;
		this.y = y;
	}
	inventoryPrint(){
		return "Player inventory: TNT="+this.tnt
			+" Cement="+this.cement
			+" Bullets="+this.bullet
			+" Treasures: "+this.treasures.length
			+"<br />";
	}
	/*positionPrint(){
		echo "Player position: X=".((this.x+1)/2)." Y=".((this.y+1)/2)."<br><br>\n";
	}/*
	/* API */
	/*inventoryToJSON(){
		inventory = array(
			"tnt" => this.tnt
			, "cement" => this.cement
			, "bullet" => this.bullet
			, "treasures" => sizeof(this.treasures)
		);
		return inventory;
	}*/
}