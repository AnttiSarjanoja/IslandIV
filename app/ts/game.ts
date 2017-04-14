/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/settings.ts" />

namespace IslandIV {
	// Holds general information about the player. Any need for more complicated implementation?
	export class Game implements IGame {
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
		private editorProvinces: Province[] = [];
		public get MapContainer(): MapContainer { return this._mapContainer; };

		constructor(data: IGame, provinceSettings: ProvinceSettings, gameSettings: GameSettings) {
			this.name = data.name;
			this.turn = data.turn;

			this.ProvinceSettings = provinceSettings;
			this.GameSettings = gameSettings;

			data.players.forEach((playerData, index) => this.players.push(new Player(playerData, index, this.ProvinceSettings)));
			data.neutralProvinces.forEach(provinceData =>
				this.neutralProvinces.push(new Province(this.ProvinceSettings.provinces[provinceData.id], provinceData))
			);

			Game.CurrentPlayer = this.players[0];
		}
		public CreateMapContainer(stage: PIXI.Container, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer, game: Game) {
			this._mapContainer = new MapContainer(stage, renderer, game);
			Input.Init(this._mapContainer);
		}
		// Returns all provinces of the game sorted by ID
		public AllProvinces(): Province[] {
			return this.neutralProvinces.concat([].concat.apply([], this.players.map(player => player.provinces))).sort((a, b) => a.id - b.id);
		}
		public InitMapEditor() {
			// TODO: Hide everything (orders)
			this.AllProvinces().forEach(province => {
				province.Container.visible = false;
				province.armies.forEach(army => army.Container.visible = false);
			});
			this.editorProvinces = this.ProvinceSettings.provinces.map((data, i) => Province.Dummy(data, i));
			this.MapContainer.InitMapEditor(this.editorProvinces);
		}
	}
}