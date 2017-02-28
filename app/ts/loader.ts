/// <reference path="player.ts" />
/// <reference path="token.ts" />

// This class opens the dataobject received from server and instancifies all objects to the game

// TODO: These are just temp stuff for loader to work -> Use real classes such as province + unit (tbd)
// Dummydata to load
interface DummyObject {
	x : number,
	y : number,
	player : Player
}

interface DummyData {
	stuf : DummyObject[]
}

let dummyPlayer1 = new Player(1, PlayerColor.BLUE, "This is one rediculously long name to *duck* UI up");
let dummyPlayer2 = new Player(2, PlayerColor.GREEN, "Mao Työmies");
let dummyPlayer3 = new Player(3, PlayerColor.ORANGE, "Urkki Kalamies");
let dummyPlayer4 = new Player(4, PlayerColor.PURPLE, "Bob");

// TODO: Get rid of these globals somehow
let tempData : DummyData = {
	stuf: [{ x: 100, y: 100, player: dummyPlayer1 },
		{ x: 200, y: 100, player: dummyPlayer2 },
		{ x: 300, y: 100, player: dummyPlayer3 },
		{ x: 400, y: 100, player: dummyPlayer4 }]
};

//
class Loader {
	private data : DummyData;

	constructor(data : DummyData) {
		this.data = data;
	}

	public Init() {
		for(let obj of this.data.stuf) {
			Token.Create(obj.x, obj.y, obj.player.color);
		}
	}
}