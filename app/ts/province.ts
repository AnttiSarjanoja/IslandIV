/// <reference path="army.ts" />
/// <reference path="main.ts" />
/// <reference path="input/selectable.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/draw_settings.ts" />
/// <reference path="drawable/shapes.ts" />
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
		get Armypos(): PIXI.Point { return new PIXI.Point(this.settings.unit_x, this.settings.unit_y); }
		get Terrain(): Terrain { return this.settings.terrain; }

		public constructor(
			private settings: ProvinceData,
			data: IProvince, 
			public readonly Owner?: Player) 
		{
			super( /* settings.terrain === "Sea" || settings.terrain === "Deep sea" ? undefined : {
				image: Owner && PixiResources[Owner.id + Province.IMG] ? Owner.id + Province.IMG : Province.IMG,
				x: settings.unit_x - settings.x,
				y: settings.unit_y - settings.y,
				name: "3_provincepic",
				scale: PROVINCE_SCALE
			} */ );

			// <TEMP>
			if (settings.terrain === undefined) { settings.terrain = "Plains"; }
			// </ TEMP>

			this.Container.position.set(this.settings.x, this.settings.y);
			
			this.MapProvince = new MapProvince(settings, this.Owner);
			if (this.Img) { this.MapProvince.SubContainers.push(this.Img); } // For editor
			MakeSelectable(this.Container, this, (over: boolean) => over ? UI.TextsToRight([this.Name, this.population.toString()]) : null);

			this.UpdateTerrain();

			this.AddText(settings.name, PROVINCE_FONT, 0, 0, this.settings.r ? this.settings.r : 0, this.settings.s ? this.settings.s : 1);
			this.Container.name = "2_province";


			Stage.addChild(this.Container);
			
			// Go through data
			this.id = data.id;
			this.size = data.size;
			this.population = data.population;
			this.resources = data.resources;

			for (let i = 0; i < this.size; i++) {
				let popGraphic: PIXI.Graphics = i < this.population ? Shapes.Population(ColorToNumber(this.Color)) : Shapes.EmptyPopulation();
				popGraphic.position.set(settings.unit_x - settings.x - 40 - i * (popGraphic.width + 1), settings.unit_y - settings.y);
				this.Container.addChild(popGraphic);
				this.MapProvince.SubContainers.push(popGraphic);
				// this.AddSprite({ image: 'population', x: settings.unit_x - settings.x - 40 + (i % 3) * -15, y: settings.unit_y - settings.y, scale: 0.2 });
			}

			for (let army of data.armies) {
				let newArmy: Army = new Army(army, this);
				newArmy.Container.x = this.settings.unit_x;
				newArmy.Container.y = this.settings.unit_y + PROVINCE_ARMY_POS;
				this.armies.push(newArmy);
				Stage.addChild(newArmy.Container);
				this.MapProvince.SubContainers.push(newArmy.Container);
			}

			// this.ChangeTint(ColorToNumber(this.Color));
			Province.currentID++;
		}

		// IMPORTANT NOTE: RemoveUnit is never needed since there should not be any situation where unit actually leaves its Province in GUI
		public AddToken(token: UnitToken) {
			this.armies[0].AddToken(token); // TODO: Multiple armies
		}

		public UpdateTerrain() {
			if (this.Container.getChildByName("ProvinceTerrain")) { this.Container.getChildByName("ProvinceTerrain").destroy(); }
			let shape: PIXI.Graphics = Shapes.Terrain(this.Terrain);
			shape.position.set(this.settings.unit_x - this.settings.x, this.settings.unit_y - this.settings.y);
			ChangeTint(shape, ColorToNumber(this.Color));
			this.Container.addChildAt(shape, 0);
			this.MapProvince.SubContainers.push(shape);
		}

		// --- Editor stuff ---

		// Editor statics
		private static SCALE_AMT = 0.05;
		private static ROTATE_AMT = 0.05; 
		private static currentID = 0;

		public static Dummy(p: PIXI.Point): void {
			let dummydata: ProvinceData = {x: p.x, y: p.y, r: 0, s: 0, unit_x: p.x, unit_y: p.y, name: "NO_NAME", terrain: "Plains", borders: []};
			let province: Province = new Province(
				dummydata,
				{ id: Province.currentID, size: 0, population: 0, resources: [], armies: [] }
			);
			MakeDraggable(province.Container, province, (p, pp) => province.ChangeTextPos(p, pp));
			CurrentGame.EditorProvinces.push(province);
			CurrentGame.ProvinceSettings.provinces.push(dummydata);
		}

		public Destroy(): void {
			if (CurrentGame.EditorMode) {
				this.Container.destroy();
				this.MapProvince.Destroy();
			}
		}

		public ChangeTextPos(d: [number, number], g: PIXI.Point): void {
			if (CurrentGame.EditorMode) {
				this.settings.x = Math.max(Math.min(g.x, CurrentGame.MapContainer.MaxX), 0) | 0;
				this.settings.y = Math.max(Math.min(g.y, CurrentGame.MapContainer.MaxY), 0) | 0;
				if (this.Text) {
					this.Text.position.x += d[0];
					this.Text.position.y += d[1];
				}
			}
		}

		// TODO:
		public SwitchTerrain(): void {
			if (CurrentGame.EditorMode) {
				switch (this.settings.terrain) {
					case "Plains": this.settings.terrain = "Forest"; break;
					case "Forest": this.settings.terrain = "Hills"; break;
					case "Hills": this.settings.terrain = "Mountains"; break;
					case "Mountains": this.settings.terrain = "Flood plains"; break;
					case "Flood plains": this.settings.terrain = "Sea"; break;
					case "Sea": this.settings.terrain = "Deep sea"; break;
					case "Deep sea": this.settings.terrain = "Plains"; break;
				};
				this.MapProvince.Borders.forEach(b => b.ReDraw(true)); // Must update borders for sea provinces
				this.UpdateTerrain();
			}
		}

		public ScaleUp(): void {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x += Province.SCALE_AMT;
				this.Text!.scale.y += Province.SCALE_AMT;
				if (this.settings.s === undefined) { this.settings.s = 1; }
				this.settings.s = +(this.settings.s + Province.SCALE_AMT).toFixed(2);
			}
		}
		public ScaleDown(): void {
			if (CurrentGame.EditorMode) {
				this.Text!.scale.x -= Province.SCALE_AMT;
				this.Text!.scale.y -= Province.SCALE_AMT;
				if (this.settings.s === undefined) { this.settings.s = 1; }
				this.settings.s = +(this.settings.s - Province.SCALE_AMT).toFixed(2);
			}
		}
		public RotateClockwise(): void {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation += Province.ROTATE_AMT;
				if (this.settings.r === undefined) { this.settings.r = 0; }
				this.settings.r = +(this.settings.r + Province.ROTATE_AMT).toFixed(2);
			}
		}
		public RotateCounterClockwise(): void {
			if (CurrentGame.EditorMode) {
				this.Text!.rotation -= Province.ROTATE_AMT;
				if (this.settings.r === undefined) { this.settings.r = 0; }
				this.settings.r = +(this.settings.r - Province.ROTATE_AMT).toFixed(2);
			}
		}
	}
}