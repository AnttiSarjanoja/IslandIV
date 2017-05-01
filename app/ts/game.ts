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
			MapBorder.AllBorders.forEach(b => b.ReDraw());

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
			return this.AllProvinces().find(p => p.MapProvince.Polygon.containsPoint(point));
		}

		public EditorProvinces: Province[] = [];

		public InitMapEditor() {
			this._editorMode = !this._editorMode;
			this._editorMode ? UI.PermaToRight([
				"Do understand that editor is purposefully not very polished",
				" - - - ",
				"All elements are draggable",
				"'x' to delete stuff",
				"'p' + mouseclick = new borderpoint",
				"'o' + mouseclick = new province",
				"'b' = define new / modify old border",
				"'e,r' and 'd,f' rotate + scale text",
				"'t' to toggle terrain type",
				"'n' to enter new text",
				"'i' to toggle selected point invis",
				"'q' to load current layout",
				"'a' to add border to selected province"
				]) : UI.PermaToRight([":3"]);
			this.AllProvinces().forEach(province => {
				this._editorMode ? MakeDraggable(province.Text!, province, (d, g) => province.ChangeTextPos(d, g)) : UnmakeDraggable(province.Container);
				if (province.Img) province.Img.visible = province.Terrain !== "Sea" && province.Terrain !== "Deep sea" && !this._editorMode;
			});
			this.EditorProvinces.forEach(p => p.Container.visible = this._editorMode); // ??
			MapBorderPoint.AllPoints.forEach(p => p.ReDraw());
			MapProvince.AllProvinces.forEach(p => p.ReDraw());
			MapBorder.AllBorders.forEach(p => p.ReDraw());
			Order.NewOrders.forEach(o => o.Container.visible = !this._editorMode);
		}
	}
}