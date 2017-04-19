/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/settings.ts" />

namespace IslandIV {
	// Holds general information about the player. Any need for more complicated implementation?
	export class Game implements IGame {
		public CurrentPlayer: Player;

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

		private _editorMode: boolean = false;
		public get EditorMode(): boolean { return this._editorMode; }
		private _mapContainer: MapContainer;
		public get MapContainer(): MapContainer { return this._mapContainer; };

		constructor(data: IGame, provinceSettings: ProvinceSettings, gameSettings: GameSettings) {
			CurrentGame = this;
			this.name = data.name;
			this.turn = data.turn;

			this.ProvinceSettings = provinceSettings;
			this.GameSettings = gameSettings;

			MapBorderPoint.InitPoints(this.ProvinceSettings.points);
			MapBorder.InitBorders(this.ProvinceSettings.borders);

			data.players.forEach((playerData, index) => this.players.push(new Player(playerData, index, this.ProvinceSettings)));
			data.neutralProvinces.forEach(provinceData =>
				this.neutralProvinces.push(new Province(this.ProvinceSettings.provinces[provinceData.id], provinceData))
			);

			SortStage();
			this.CurrentPlayer = this.players[0];
		}
		public CreateMapContainer() {
			this._mapContainer = new MapContainer(this);
			Input.Init(this._mapContainer);
		}
		// Returns all provinces of the game sorted by ID
		public AllProvinces(): Province[] {
			return this.neutralProvinces.concat([].concat.apply([], this.players.map(player => player.provinces))).sort((a, b) => a.id - b.id);
		}
		public GetProvince(n: number): Province {
			return this.AllProvinces().find(p => p.id == n)!; // Return possible undefined
		}
		public GetProvinceUnder(point: PIXI.Point): Province | undefined {
			return this.AllProvinces().find(p => p.Text !== undefined && p.Text.containsPoint(point) );
		}

		public InitMapEditor() {
			this._editorMode = !this._editorMode;
			this.AllProvinces().forEach(province => MakeDraggable(province.Container, province, (p, pp) => province.ChangePos(p)));
			MapProvince.AllProvinces.forEach(p => p.Draw());
			MapBorder.AllBorders.forEach(p => p.Draw());
			MapBorderPoint.AllPoints.forEach(p => p.Draw(true));
			SortStage();
		}
	}
}