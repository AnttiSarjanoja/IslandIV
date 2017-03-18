/// <reference path="army.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="unit.ts" />
/// <reference path="game.ts" />

// This class opens the received dataobject from server and instancifies all objects to the game
// Atm. works with Init () -> handler-chain -> LoadImages() -> CreateEverything()
abstract class Loader {
	private static _provinceSettings : any;
	private static _gameSettings : any;
	private static _gameData : Game; // TODO: Game

	public static MapContainer: PIXI.Container;

	static get ProvinceSettings(): any {
		return this._provinceSettings;
	}
	static get GameSettings(): any {
		return this._gameSettings;
	}
	static get GameData(): any {
		return this._gameData;
	}

	public static CreateEverything() {
		if(this.ProvinceSettings === undefined || this.GameData === undefined) { // TODO: this.gameSettings
			throw new Error("Data loader error!");
		}

		this.GameData.players.forEach(function (player : IPlayer) {
			let tempColor : string = player.color;
			player.provinces.forEach(function (province : IProvince) {
				let obj = Loader.ProvinceSettings.provinces[province.id - 1]; // TEMPORARY AND VERY UGLY YES
				new Province(province, obj.x, obj.y, StringToColor(tempColor));
			});
		});
	}

	public static LoadImages() {
		let loader: PIXI.loaders.Loader = new PIXI.loaders.Loader('./img/');
		loader.add('tausta', Loader.ProvinceSettings.map);
		loader.add('bunny', 'bunny.png'); // TODO: Just temporary

		// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
		// loader.add(sprite_sheets_arr);
		function onLoad(loader: PIXI.loaders.Loader, resources: PIXI.loaders.Resource) {
			let tausta = new PIXI.Sprite(resources['tausta'].texture);
			tausta.name = 'tausta';

			Loader.MapContainer.addChild(tausta);
			Loader.MapContainer.interactive = true; // TODO: Mb set interaction functions here too
			Loader.CreateEverything();
		}

		loader.load((loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) => onLoad(loader, resources));
	}

	public static SaveProvinceSettings(data : any) {
		// TODO: Validate
		this._provinceSettings = data;
	}
	public static SaveGameSettings(data : any) {
		this._gameSettings = data;
	}
	public static SaveGameData(data : any) {
		this._gameData = data;
	}

	// Use this when server supports it
	public static Init(container: PIXI.Container) {
		this.MapContainer = container;

		function gameSettingsResponseHandler() {
			Loader.SaveGameSettings(this.response);
			Loader.LoadImages();
		}
		function provinceResponseHandler() {
			Loader.SaveProvinceSettings(this.response);
			let settingsRequest = new XMLHttpRequest();
			settingsRequest.open('GET', Loader.GameData.settingsFile, true); // TODO: Undefined -> Default file?
			settingsRequest.responseType = 'json';
			settingsRequest.onload = gameSettingsResponseHandler;

			settingsRequest.send();
		}
		function gameResponseHandler () {
			// let parsedJSON = this.response; //JSON.parse(this.response);
			Loader.SaveGameData(this.response);
			let provinceRequest = new XMLHttpRequest();
			provinceRequest.open('GET', Loader.GameData.provinceFile, true); // TODO: Undefined -> Default file?
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