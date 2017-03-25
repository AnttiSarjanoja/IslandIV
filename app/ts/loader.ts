/// <reference path="army.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="unit.ts" />
/// <reference path="game.ts" />

// This class opens the received dataobject from server and instancifies all objects to the game
// Atm. works with Init () -> handler-chain -> LoadImages() -> CreateEverything()
abstract class Loader {
	private static _provinceSettings: ProvinceSettings;
	private static _gameSettings: GameSettings;
	private static _gameData: IGame; // TODO: Game

	public static MapContainer: PIXI.Container;

	static get ProvinceSettings(): ProvinceSettings {
		return this._provinceSettings;
	}
	static get GameSettings(): GameSettings {
		return this._gameSettings;
	}
	static get GameData(): IGame {
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
				new Province(obj.x, obj.y, obj.name, province, StringToColor(tempColor));
			});
		});
	}

	public static LoadImages() {
		let loader: PIXI.loaders.Loader = new PIXI.loaders.Loader('./img/');
		loader.add('tausta', Loader.ProvinceSettings.map);
		loader.add('unit', Loader.GameSettings.unitIMG); // Prolly temporary, if using spritesheets
		loader.add('province', Loader.GameSettings.provinceIMG);

		// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
		// loader.add(sprite_sheets_arr);
		function onLoad(loader: PIXI.loaders.Loader, resources: PIXI.loaders.Resource) {
			DrawableBase.Resource = resources;

			// Add background
			let tausta: PIXI.Sprite = new PIXI.Sprite(resources['tausta'].texture);
			tausta.name = 'tausta';

			Loader.MapContainer.addChild(tausta);
			Loader.MapContainer.interactive = true; // TODO: Mb set interaction functions here too
			Loader.CreateEverything();
		}

		loader.load((loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) => onLoad(loader, resources));
	}

	public static SaveProvinceSettings(data: any) { // Any since it really can be anything (?)
		// TODO: Validate
		if (data === undefined) throw new Error("No response for ProvinceSettings!");
		this._provinceSettings = data;
	}
	public static SaveGameSettings(data: any) {
		if (data === undefined) throw new Error("No response for GameSettings!");
		this._gameSettings = data;
	}
	public static SaveGameData(data: any) {
		if (data === undefined) throw new Error("No response for GameData!");
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

interface ProvinceData {
	x: number,
	y: number,
	name: string
}

interface ProvinceSettings {
	map: string,
	provinces: ProvinceData[]
}

interface GameSettings {
	// Images for stuff, must be located at /img/
	provinceIMG: string,
	unitIMG: string
}