/// <reference path="game.ts" />
/// <reference path="main.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/settings.ts" />

// This class opens the received dataobject from server and instancifies all objects to the game
// Atm. works with Init () -> handler-chain -> LoadImages() -> CreateEverything()
abstract class Loader {
	private static _provinceSettings: ProvinceSettings;
	private static _gameSettings: GameSettings;
	private static _gameData: IGame; // TODO: Game
	private static cb: () => void;

	// public static MapContainer: PIXI.Container;

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
		if(this.ProvinceSettings === undefined || this.GameData === undefined || this.GameSettings === undefined) {
			throw new Error("Data loader error!");
		}
		IslandIV.Game = new Game(this.GameData, this.ProvinceSettings, this.GameSettings);
	}

	public static LoadImages() {
		let loader: PIXI.loaders.Loader = new PIXI.loaders.Loader('./img/');
		loader.add('tausta', Loader.ProvinceSettings.map);
		loader.add('unit', Loader.GameSettings.unitIMG); // Prolly temporary, if using spritesheets
		loader.add('province', Loader.GameSettings.provinceIMG);

		// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
		// loader.add(sprite_sheets_arr);
		loader.load((loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) => {
			DrawableBase.Resource = resources;
			this.cb();
			Loader.CreateEverything();
		});//onLoad(loader, resources));
	}

	public static SaveProvinceSettings(data: any) { // Any since it really can be anything (?)
		if (data === undefined) throw new Error("No response for ProvinceSettings!");
		this._provinceSettings = data; // TODO: Need to validate map and array?
		this._provinceSettings.provinces.forEach((province: ProvinceData, index: number) => {
			if (province.x === undefined) throw new Error("Provincedata error: (" + index + ") No x-coord!");
			if (province.y === undefined) throw new Error("Provincedata error: (" + index + ") No y-coord!");
			// Name can be empty?
			if (province.neighbours === undefined) throw new Error("Provincedata error: (" + index + ") No neighbours!");
			if (province.neighbours.length === 0) throw new Error("Provincedata error: (" + index + ") Empty neighbours!");
			if (province.neighbours.indexOf(index) !== -1) throw new Error("Provincedata error: (" + index + ") Self as neighbour!");
			province.neighbours.forEach((neighbour) => {
				if (!this._provinceSettings.provinces[neighbour].neighbours.some((i) => { return index === i; })) {
					throw new Error("Provincedata error: (" + index + ") No pair neighbour with (" + neighbour + ")!");
				}
			});
		});
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
	public static Init(cb: () => void) { // vcontainer: PIXI.Container
		this.cb = cb;

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
