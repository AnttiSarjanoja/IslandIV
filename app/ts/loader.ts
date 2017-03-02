/// <reference path="army.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="unit.ts" />

// This class opens the received dataobject from server and instancifies all objects to the game

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

//
class Loader {
	private data : DummyData;

	constructor() {
	}

	// Use this when server supports it
	public Init() {
		function dummyDataListener () {
			console.log(JSON.parse(this.responseText));
			this.data = JSON.parse(this.responseText);
			for(let obj of this.data) {
				console.log(obj);
				Unit.Create(obj.x, obj.y, StringToColor(obj.player.color));
			}
		}

		let request = new XMLHttpRequest();
		request.onload = dummyDataListener;
		request.open("get", "game.json", true);
		request.send();
	}
}