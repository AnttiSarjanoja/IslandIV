/// <reference path="army.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="unit.ts" />
/// <reference path="game.ts" />

// This class opens the received dataobject from server and instancifies all objects to the game
abstract class Loader {
	private static provinceSettings : any;
	private static gameSettings : any;
	private static gameData : Game; // TODO: Game

	public static CreateEverything() {
		if(this.provinceSettings === undefined || this.gameData === undefined) { // TODO: this.gameSettings
			console.log("Murr");
			return;
		}

		console.log("Yay");

		this.gameData.players.forEach(function (player : Player) {
			player.provinces.forEach(function (province : Province) {
				let obj = Loader.provinceSettings[province.id - 1]; // TEMPORARY AND VERY UGLY YES
				Unit.Create(obj.x, obj.y, StringToColor(obj.color));
			});
		});
		//for(let obj of this.gameData) {
			/*
			console.log(obj);
			Unit.Create(obj.x, obj.y, StringToColor(obj.player.color));*/
		//}
	}

	public static SaveProvinceSettings(data : any) {
		this.provinceSettings = data;
	}

	public static SaveGameData(data : any) {
		this.gameData = data;
	}

	// Use this when server supports it
	public static Init() {
		function provinceResponseHandler() {
			Loader.SaveProvinceSettings(this.response);
			Loader.CreateEverything();
		}

		function gameResponseHandler () {
			let parsedJSON = this.response; //JSON.parse(this.response);
			Loader.SaveGameData(parsedJSON);
			let provinceRequest = new XMLHttpRequest();
			provinceRequest.open('GET', parsedJSON.provinceFile, true);
			provinceRequest.responseType = 'json';
			provinceRequest.onload = provinceResponseHandler;

			provinceRequest.send();
		}

		let request = new XMLHttpRequest();
		request.open('GET', 'data', true);
		request.responseType = 'json';
		request.onload = gameResponseHandler;
		request.send();
	}
}