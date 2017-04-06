/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/settings.ts" />

// Holds general information about the player. Any need for more complicated implementation?
class Game implements IGame {
	public static CurrentPlayer: Player;

	readonly name: string;
	readonly players: Player[] = [];
	readonly messages: IMessage[] = [];
	readonly turn: number;
	readonly settingsFile: string = "";
	readonly provinceFile: string = "";
	readonly religions: IReligion[] = [];
	readonly neutralProvinces: Province[] = [];

	readonly ProvinceSettings: ProvinceSettings;
	readonly GameSettings: GameSettings;

	private _mapContainer: MapContainer;
	public get MapContainer(): MapContainer { return this._mapContainer; };

	constructor(data: IGame, provinceSettings: ProvinceSettings, gameSettings: GameSettings) {
		this.name = data.name;
		this.turn = data.turn;

		this.ProvinceSettings = provinceSettings;
		this.GameSettings = gameSettings;

		data.players.forEach((playerData: IPlayer, index: number) => {
			this.players.push(new Player(playerData, index, this.ProvinceSettings));
		});
		data.neutralProvinces.forEach((provinceData: IProvince, index: number) => {
			let obj = this.ProvinceSettings.provinces[provinceData.id];
			this.neutralProvinces.push(new Province(obj.x, obj.y, obj.name, obj.neighbours, provinceData, "GRAY"));
		});

		Game.CurrentPlayer = this.players[0];
	}
	public CreateMapContainer(stage: PIXI.Container, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer, provinceSettings: ProvinceSettings) {
		this._mapContainer = new MapContainer(stage, renderer, provinceSettings);
		Input.Init(this._mapContainer);
	}

}