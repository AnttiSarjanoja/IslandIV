/// <reference path="army.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="unit.ts" />

// This class opens the received dataobject from server and instancifies all objects to the game
class Loader {

	constructor() {
	}

	// Use this when server supports it
	public Init() {
		function responseHandler () {
			let data = this.response;
			for(let obj of data) {
				console.log(obj);
				Unit.Create(obj.x, obj.y, StringToColor(obj.player.color));
			}
		}

		let request = new XMLHttpRequest();
		request.open('GET', '/data/', true);
		request.responseType = 'json';
		request.onload = responseHandler;

		request.send();
	}
}