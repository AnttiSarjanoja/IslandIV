/// <reference path="army.ts" />
/// <reference path="main.ts" />
/// <reference path="input/selectable.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/draw_settings.ts" />
/// <reference path="map/mapDrawables.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />
/// <reference path="../../common/settings.ts" />

namespace IslandIV {
	export class Province extends Drawable implements IProvince {
		public static readonly IMG: string = SettingsIMGnames[0]; // Default value

		// IProvince
		readonly id: number;
		readonly armies: Army[] = [];
		readonly size: number;
		readonly population: number;
		readonly resources: string[];

		public MapProvince: MapProvince;

		get Name(): string { return this.settings.name; };
		set Name(s: string) { if (CurrentGame.EditorMode) this.settings.name = s; };
		get Neighbours(): Province[] {
			let mapProvinces: MapProvince[] = MapProvince.AllProvinces.filter(mp => mp !== this.MapProvince && mp.Borders.some(b => this.MapProvince.Borders.some(bb => b === bb)));
			return CurrentGame.AllProvinces().filter(p => mapProvinces.some(mp => mp === p.MapProvince));
		};
		get Color(): PlayerColor { return this.Owner ? this.Owner.color : DEFAULT_COLOR; };
		get Text(): PIXI.Text | undefined {
			let text: PIXI.DisplayObject = this.Container.getChildByName("3_text");;
			return text instanceof PIXI.Text ? text : undefined;
		}
		get Img(): PIXI.Sprite | undefined {
			let img: PIXI.DisplayObject = this.Container.getChildByName("3_provincepic");
			return img instanceof PIXI.Sprite ? img : undefined;
		}
		get Armypos(): PIXI.Point {
			return new PIXI.Point(this.settings.unit_x, this.settings.unit_y);
		}

		public constructor(
			private settings: ProvinceData,
			data: IProvince, 
			public readonly Owner?: Player) 
		{
			super({
				image: Owner && PixiResources[Owner.id + Province.IMG] ? Owner.id + Province.IMG : Province.IMG,
				x: settings.unit_x - settings.x,
				y: settings.unit_y - settings.y,
				name: "3_provincepic",
				scale: PROVINCE_SCALE
			});
			this.Container.x = this.settings.x;
			this.Container.y = this.settings.y;
			this.AddText(settings.name, PROVINCE_FONT, 0, 0, this.settings.r ? this.settings.r : 0, this.settings.s ? this.settings.s : 1);
			this.Container.name = "2_province";

			this.MapProvince = new MapProvince(settings, this.Owner);
			if (this.Img) this.MapProvince.ArmyContainers.push(this.Img); // For editor
			MakeSelectable(this.Container, this, (over: boolean) => over ? UI.TextsToRight([this.Name, this.population.toString()]) : null);
			Stage.addChild(this.Container);
			
			// Go through data
			this.id = data.id;
			this.size = data.size;
			this.population = data.population;
			this.resources = data.resources;

			for (let i = 0; i < this.population; i++) {
				this.AddSprite({ image: 'population', x: settings.unit_x - settings.x - 40 + (i % 3) * -15, y: settings.unit_y - settings.y, scale: 0.2 });
			}

			for (let army of data.armies) {
				let newArmy: Army = new Army(army, this);
				newArmy.Container.x = this.settings.unit_x;
				newArmy.Container.y = this.settings.unit_y + PROVINCE_ARMY_POS;
				this.armies.push(newArmy);
				Stage.addChild(newArmy.Container);
				this.MapProvince.ArmyContainers.push(newArmy.Container);
			}

			this.ChangeTint(ColorToNumber(this.Color));
			Province.currentID++;
		}

		// IMPORTANT NOTE: RemoveUnit is never needed since there should not be any situation where unit actually leaves its Province in GUI
		public AddToken(token: UnitToken) {
			this.armies[0].AddToken(token); // TODO: Multiple armies
		}


		// --- Editor stuff ---

		// Editor statics
		private static SCALE_AMT = 0.05;
		private static ROTATE_AMT = 0.05; 
		private static currentID = 0;

		public static Dummy(p: PIXI.Point) {
			let dummydata: ProvinceData = {x: p.x, y: p.y, r: 0, s: 0, unit_x: p.x, unit_y: p.y, name: "NO_NAME", terrain: "Plains", borders: []};
			let province: Province = new Province(
				dummydata,
				{ id: Province.currentID, size: 0, population: 0, resources: [], armies: [] }
			);
			MakeDraggable(province.Container, province, (p, pp) => province.ChangeTextPos(p, pp));
			CurrentGame.EditorProvinces.push(province);
			CurrentGame.ProvinceSettings.provinces.push(dummydata);
		}

		public Destroy() {
			if (CurrentGame.EditorMode) {
				this.Container.destroy();
				this.MapProvince.Destroy();
			}
		}

		public ChangeTextPos(d: [number, number], g: PIXI.Point) {
			if (CurrentGame.EditorMode) {
				this.settings.x = Math.max(Math.min(g.x, CurrentGame.MapContainer.MaxX), 0) | 0;
				this.settings.y = Math.max(Math.min(g.y, CurrentGame.MapContainer.MaxY), 0) | 0;
				if (this.Text) {
					this.Text.position.x += d[0];
					this.Text.position.y += d[1];
				}
			}
		}

		public ScaleUp() {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x += Province.SCALE_AMT;
				this.Text!.scale.y += Province.SCALE_AMT;
				if (this.settings.s === undefined) { this.settings.s = 1; }
				this.settings.s = +(this.settings.s + Province.SCALE_AMT).toFixed(2);
			}
		}
		public ScaleDown() {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x -= Province.SCALE_AMT;
				this.Text!.scale.y -= Province.SCALE_AMT;
				if (this.settings.s === undefined) { this.settings.s = 1; }
				this.settings.s = +(this.settings.s - Province.SCALE_AMT).toFixed(2);
			}
		}
		public RotateClockwise() {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation += Province.ROTATE_AMT;
				if (this.settings.r === undefined) { this.settings.r = 0; }
				this.settings.r = +(this.settings.r + Province.ROTATE_AMT).toFixed(2);
			}
		}
		public RotateCounterClockwise() {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation -= Province.ROTATE_AMT;
				if (this.settings.r === undefined) { this.settings.r = 0; }
				this.settings.r = +(this.settings.r - Province.ROTATE_AMT).toFixed(2);
			}
		}
	}
}