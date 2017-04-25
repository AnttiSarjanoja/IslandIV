/// <reference path="army.ts" />
/// <reference path="main.ts" />
/// <reference path="input/selectable.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="map/mapDrawables.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />
/// <reference path="../../common/settings.ts" />

namespace IslandIV {
	export class Province extends Drawable implements IProvince {
		// public static Picture: string = 'province'; // Default value

		// IProvince
		readonly id: number;
		readonly armies: Army[] = [];
		readonly size: number;
		readonly population: number;
		readonly resources: string[];

		public MapProvince: MapProvince;
		// public Neighbours: Province[] = [];

		get Name(): string { return this.settings.name; };
		set Name(s: string) { if (CurrentGame.EditorMode) this.settings.name = s; };
		get Neighbours(): Province[] {
			let mapProvinces: MapProvince[] = MapProvince.AllProvinces.filter(mp => mp !== this.MapProvince && mp.Borders.some(b => this.MapProvince.Borders.some(bb => b === bb)));
			return CurrentGame.AllProvinces().filter(p => mapProvinces.some(mp => mp === p.MapProvince));
		};
		get Color(): PlayerColor { return this.Owner ? this.Owner.color : "GRAY"; };
		get Text(): PIXI.Text | undefined {
			let text: PIXI.DisplayObject = this.Container.getChildAt(0);
			return text instanceof PIXI.Text ? text : undefined;
		}

		public constructor(
			private settings: ProvinceData,
			data: IProvince, 
			public readonly Owner?: Player) 
		{
			super(); // {image: Province.Picture}
			this.Container.x = this.settings.x;
			this.Container.y = this.settings.y;
			this.AddText(settings.name, 0, 0, this.settings.r ? this.settings.r : 0);
			this.Container.name = "2_province";

			this.MapProvince = new MapProvince(settings, this.Owner);
			MakeSelectable(this.Container, this, (over: boolean) => over ? UI.TextsToRight([this.Name, this.population.toString()]) : null);
			Stage.addChild(this.Container);
			
			// Go through data
			this.id = data.id;
			this.size = data.size;
			this.population = data.population;
			this.resources = data.resources;

			for (let army of data.armies) {
				let newArmy: Army = new Army(army, this.Color, this);
				newArmy.Container.x = this.settings.unit_x;
				newArmy.Container.y = this.settings.unit_y;
				this.armies.push(newArmy);
				Stage.addChild(newArmy.Container);
				this.MapProvince.ArmyContainers.push(newArmy.Container);
			}

			Province.currentID++;
		}

		// IMPORTANT NOTE: RemoveUnit is never needed since there should not be any situation where unit actually leaves its Province in GUI
		public AddToken(token: UnitToken) {
			this.armies[0].AddToken(token); // TEMP	
		}


		// --- Editor stuff ---
		private static currentID = 0;
		public static Dummy(p: PIXI.Point) {
			let dummydata: ProvinceData = {x: p.x, y: p.y, r: 0, s: 0, unit_x: p.x, unit_y: p.y, name: "NO_NAME", terrain: "Plains", borders: []};
			let province: Province = new Province(
				dummydata,
				{ id: Province.currentID, size: 0, population: 0, resources: [], armies: [] }
			);
			MakeDraggable(province.Container, province, (p, pp) => province.ChangePos(p));
			CurrentGame.EditorProvinces.push(province);
			CurrentGame.ProvinceSettings.provinces.push(dummydata);
		}
		public Destroy() {
			if (CurrentGame.EditorMode) {
				this.Container.destroy();
				this.MapProvince.Destroy();
				// Works?
			}
		}

		public ChangePos(point: PIXI.Point) {
			if (CurrentGame.EditorMode) {
				this.settings.x = Math.max(Math.min(point.x, CurrentGame.MapContainer.MaxX), 0) | 0; //point.x | 0;
				this.settings.y = Math.max(Math.min(point.y, CurrentGame.MapContainer.MaxY), 0) | 0; //point.x | 0;
				this.Container.position.x = this.settings.x;
				this.Container.position.y = this.settings.y;
			}
		}

		private static SCALE_AMT = 0.05;
		private static ROTATE_AMT = 0.05; 
		public ScaleUp() {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x += Province.SCALE_AMT;
				this.Text!.scale.y += Province.SCALE_AMT;
				if (this.settings.s === undefined) this.settings.s = 1;
				this.settings.s = +(this.settings.s + Province.SCALE_AMT).toFixed(2);
			}
		}
		public ScaleDown() {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x -= Province.SCALE_AMT;
				this.Text!.scale.y -= Province.SCALE_AMT;
				if (this.settings.s === undefined) this.settings.s = 1;
				this.settings.s = +(this.settings.s - Province.SCALE_AMT).toFixed(2);
			}
		}
		public RotateClockwise() {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation += Province.ROTATE_AMT;
				if (this.settings.r === undefined) this.settings.r = 0;
				this.settings.r = +(this.settings.r + Province.ROTATE_AMT).toFixed(2);
			}
		}
		public RotateCounterClockwise() {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation -= Province.ROTATE_AMT;
				if (this.settings.r === undefined) this.settings.r = 0;
				this.settings.r = +(this.settings.r - Province.ROTATE_AMT).toFixed(2);
			}
		}
	}
}