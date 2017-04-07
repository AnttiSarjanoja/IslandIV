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
			let settings = this.ProvinceSettings.provinces[provinceData.id];
			this.neutralProvinces.push(new Province(settings, provinceData));
		});

		Game.CurrentPlayer = this.players[0];
	}
	public CreateMapContainer(stage: PIXI.Container, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer, game: Game) {
		this._mapContainer = new MapContainer(stage, renderer, game);
		Input.Init(this._mapContainer);
	}
	// Returns all provinces of the game sorted by ID
	public AllProvinces(): Province[] {
		return this.neutralProvinces.concat([].concat.apply([], this.players.map((player: Player) => { return player.provinces; }))).sort((a, b) => a.id - b.id);
	}

}