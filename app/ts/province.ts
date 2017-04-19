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

		public Neighbours: Province[] = [];

		get Name(): string { return this.settings.name; };
		set Name(s: string) { if (CurrentGame.EditorMode) this.settings.name = s; };
		// get Neighbours(): Province[] { return this.settings.borders.map(b => MapBorder.AllBorders[b]).map(mb => mb.MapProvinces.find(mp => mp && mp.Province !== this).Province); }; // TODO: Separate for getting neighbour provinces vs settingsdata
		// get Points(): [number, number, boolean][] { return [].concat.apply([], this.settings.neighbours.map(n => n.borderPoints)); };
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

			let mapProvince: MapProvince = new MapProvince(settings, this.Owner);
			if (settings.neighbours) this.Neighbours = CurrentGame.AllProvinces().filter(p => settings.neighbours.find(n => n === p.id));
			// CurrentGame.AllProvinces().filter(p =>  p.id);
			// settings.borders.forEach(b => CurrentGame.ProvinceSettings.provinces.filter((p, i) => CurrentGame.ProvinceSettings.borders[b])

			MakeSelectable(this.Container, this, (over: boolean) => UI.TextsToRight([this.Name, this.population.toString()]));
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
				mapProvince.ArmyContainers.push(newArmy.Container);
			}
		}

		// IMPORTANT NOTE: RemoveUnit is never needed since there should not be any situation where unit actually leaves its Province in GUI
		public AddToken(token: UnitToken) {
			this.armies[0].AddToken(token); // TEMP	
		}


		// --- Editor stuff ---
		public static Dummy(settings: ProvinceData, id: number) {
			return new Province(settings, { id: id, size: 0, population: 0, resources: [], armies: [] });
		}

		public ChangePos(point: PIXI.Point) {
			if (CurrentGame.EditorMode) {
				this.Container.position.copy(point);
				this.settings.x = point.x | 0;
				this.settings.y = point.y | 0;
			}
		}
		public ScaleUp() {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x += 0.1;
				this.Text!.scale.y += 0.1;
				if (this.settings.s === undefined) this.settings.s = 1;
				this.settings.s = this.settings.s + 0.1 | 0;
			}
		}
		public ScaleDown() {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x -= 0.1;
				this.Text!.scale.y -= 0.1;
				if (this.settings.s === undefined) this.settings.s = 1;
				this.settings.s = this.settings.s - 0.1 | 0;
			}
		}
		public RotateClockwise() {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation += 0.1;
				if (this.settings.r === undefined) this.settings.r = 0;
				this.settings.r = this.settings.r + 0.1 | 0;
			}
		}
		public RotateCounterClockwise() {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation -= 0.1;
				if (this.settings.r === undefined) this.settings.r = 0;
				this.settings.r = this.settings.r - 0.1 | 0;
			}
		}
	}
}