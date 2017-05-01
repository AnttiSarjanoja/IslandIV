/// <reference path="../main.ts" />
/// <reference path="../drawable/draw_settings.ts" />
/// <reference path="../input/draggable.ts" />
/// <reference path="../input/selectable.ts" />
/// <reference path="../../../common/settings.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// These classes exist mostly for map editor uses only
namespace IslandIV {
	// Kinda extends ProvinceData
	export class MapProvince {
		public static AllProvinces: MapProvince[] = [];

		public Borders: MapBorder[];
		public Points: MapBorderPoint[]; // To help drawing
		public ArmyContainers: (PIXI.Sprite | PIXI.Container)[] = [];

		public Polygon: PIXI.Graphics; // Area
		private unitloc: PIXI.Graphics | undefined; // Unit position
		private color: number;

		get Terrain(): Terrain { return this.data.terrain; }

		constructor (public data: ProvinceData, public Owner: Player | undefined) {
			if (data.unit_x === undefined) { data.unit_x = data.x; }
			if (data.unit_y === undefined) { data.unit_y = data.y; }
			if (data.terrain === undefined) { data.terrain = "Plains"; }

			this.color = ColorToNumber(this.Owner ? this.Owner.color : DEFAULT_COLOR);
			this.Borders = data.borders.map(n => {
				let border: MapBorder | undefined = MapBorder.AllBorders[n];
				if (border) return border;
				else throw new Error("Broken provincedata: no Border in index " + n);
			});
			this.UpdateBorders();
			MapProvince.AllProvinces.push(this);
		}

		public Destroy(): void {
			if (CurrentGame.EditorMode) {
				MapProvince.AllProvinces.splice(MapProvince.AllProvinces.indexOf(this), 1);
				CurrentGame.ProvinceSettings.provinces.splice(CurrentGame.ProvinceSettings.provinces.indexOf(this.data), 1);
				this.Polygon.destroy();
				if (this.unitloc) this.unitloc.destroy();
			}
		}

		public ToggleBorder(border: MapBorder): void {
			if (this.Borders.some(b => b === border)) this.removeBorder(border);
			else this.addBorder(border);
		}
		private addBorder(border: MapBorder): void {
			console.log("Added border");
			this.Borders.push(border);
			this.data.borders.push(MapBorder.AllBorders.indexOf(border));
			this.UpdateBorders();
			SortStage();
		}
		public removeBorder(border: MapBorder): void {
			this.Borders.splice(this.Borders.indexOf(border), 1);
			this.data.borders.splice(this.data.borders.indexOf(MapBorder.AllBorders.indexOf(border)), 1);
			this.UpdateBorders();
			SortStage();
		}

		public UpdateBorders(): void {
			this.Borders.forEach(b => {
				let mp: MapProvince | undefined = MapProvince.AllProvinces.find(mp => mp !== this && mp.Borders.some(bb => b === bb));
				if (mp) b.SameOwner = this.Owner === mp.Owner;
			});
			this.UpdatePoints();
		}

		public UpdatePoints(): void {
			this.Points = [].concat.apply([], this.Borders.map(b => b.Points));
			this.Points = this.Points.filter( // Filter uniques
				(p, pos, a) => { return a.findIndex(pp => (p.x == pp.x && p.y == pp.y)) == pos; });

			// Sort clockwise, thanks to @ciamej from stackoverflow
			let center: [number, number] = [0, 0];
			this.Points.forEach(p => { center[0] += p.x; center[1] += p.y; }); // Sum
			center[0] = center[0] / this.Points.length | 0;
			center[1] = center[1] / this.Points.length | 0;

			// Magic
			this.Points.sort((a, b) =>
			{
				if (a.x - center[0] >= 0 && b.x - center[0] < 0) return -1;
				if (a.x - center[0] < 0 && b.x - center[0] >= 0) return 1;
				if (a.x - center[0] == 0 && b.x - center[0] == 0) {
					if (a.y - center[1] >= 0 || b.y - center[1] >= 0) return a.y > b.y ? -1 : 1;
					return b.y > a.y ? -1 : 1;
				}
				// compute the cross product of vectors (center -> a) x (center -> b)
				let det: number = (a.x - center[0]) * (b.y - center[1]) - (b.x - center[0]) * (a.y - center[1]);
				if (det < 0) return -1;
				if (det > 0) return 1;

				// points a and b are on the same line from the center
				// check which point is closer to the center
				let d1 = (a.x - center[0]) * (a.x - center[0]) + (a.y - center[1]) * (a.y - center[1]);
				let d2 = (b.x - center[0]) * (b.x - center[0]) + (b.y - center[1]) * (b.y - center[1]);
				return d1 > d2 ? -1 : 1;
			});

			this.draw();
		}

		public ReDraw(): void {
			this.draw();
			SortStage();
		}

		private draw(): void {
			if (this.Polygon) this.Polygon.destroy();
			if (this.Points.length > 0) {
				this.Polygon = new PIXI.Graphics();
				this.Polygon.name = "1_ProvincePoly";
				this.Polygon.beginFill(CurrentGame.EditorMode ? 0x111111 : this.color, 0.6);
				this.Polygon.moveTo(this.Points[this.Points.length - 1].x, this.Points[this.Points.length - 1].y);
				this.Points.forEach(point => this.Polygon.lineTo(point.x, point.y));
				this.Polygon.endFill();
				this.Polygon.blendMode = 2; // Multiply

				Stage.addChild(this.Polygon);
			}
			
			if (this.unitloc) {
				this.unitloc.destroy();
				this.unitloc = undefined;
			}
			if (!CurrentGame.EditorMode) return;
			this.unitloc = new PIXI.Graphics();
			this.unitloc.name = "2_UnitLoc";
			this.unitloc.position.x = this.data.unit_x;
			this.unitloc.position.y = this.data.unit_y;
			this.unitloc.lineStyle(0);
			this.unitloc.beginFill(this.data.terrain === "Sea" || this.data.terrain === "Deep sea" ? 0x0000FF : 0xFF0000, 0.85);
			this.unitloc.drawCircle(0, 0, 10);
			this.unitloc.endFill();

			MakeSelectable(this.unitloc, this);
			MakeDraggable(this.unitloc, this, (d: [number, number], g: PIXI.Point) => {
				this.data.unit_x = Math.max(Math.min(g.x, CurrentGame.MapContainer.MaxX), 0) | 0;
				this.data.unit_y = Math.max(Math.min(g.y, CurrentGame.MapContainer.MaxY), 0) | 0;
				this.unitloc!.position.x = this.data.unit_x;
				this.unitloc!.position.y = this.data.unit_y;

				this.ArmyContainers.forEach(c => {
					if (c instanceof PIXI.Sprite) {
						c.position.x += d[0];
						c.position.y += d[1];
					}
					else {
						c.position.x = this.data.unit_x;
						c.position.y = this.data.unit_y;
					}
				}); // TODO: Different with many armies?
			});
			Stage.addChild(this.unitloc);
		}
	}

	// Kinda extends Border
	export class MapBorder {
		public static AllBorders: MapBorder[] = [];
		public static InitBorders(data: Border[]) { data.forEach(pn => new MapBorder(pn)); }

		public Type: BorderType;
		public Points: MapBorderPoint[] = [];
		public SameOwner: boolean = false;
		public Selectable: Selectable;

		private graphic: PIXI.Graphics;

		public static New(): MapBorder {
			let data: Border = { borderPoints: [] };
			CurrentGame.ProvinceSettings.borders.push(data);
			return new MapBorder(data);
		}

		constructor (public data: Border) {
			this.Points = data.borderPoints.map(bp => {
				let point: MapBorderPoint | undefined = MapBorderPoint.AllPoints[bp];
				if (point) return point;
				else throw new Error("Broken provincedata: no Borderpoint in index " + bp);
			});
			this.draw();
			MapBorder.AllBorders.push(this);
		}
		public Destroy(): void {
			if (CurrentGame.EditorMode) {
				let dataindex: number = CurrentGame.ProvinceSettings.borders.indexOf(this.data);
				CurrentGame.ProvinceSettings.borders.splice(dataindex, 1);
				MapBorder.AllBorders.splice(MapBorder.AllBorders.indexOf(this), 1);
				MapProvince.AllProvinces.forEach(mp => {
					mp.data.borders = mp.data.borders.filter(b => b != dataindex).map(b => b > dataindex ? (b - 1) : b);
					mp.Borders = mp.Borders.filter(b => b !== this);
					mp.UpdateBorders();
				});
				this.graphic.destroy(); // Should always exist if calling this
			}
		}

		public Clear(): void {
			this.Points = [];
			this.data.borderPoints = [];
			this.ReDraw(true);
			MapProvince.AllProvinces.filter(mp => mp.Borders.some(b => b === this)).forEach(mp => mp.UpdatePoints());
		}

		public TogglePoint(point: MapBorderPoint): void {
			if (this.Points.some(p => p === point)) this.removePoint(point);
			else this.addPoint(point);
		}
		private addPoint(point: MapBorderPoint): void {
			this.Points.push(point);
			this.data.borderPoints.push(MapBorderPoint.AllPoints.indexOf(point));
			MapProvince.AllProvinces.filter(mp => mp.Borders.some(b => b === this)).forEach(mp => mp.UpdatePoints());
			this.ReDraw();
		}
		private removePoint(point: MapBorderPoint): void {
			this.Points.splice(this.Points.indexOf(point), 1);
			this.data.borderPoints.splice(this.data.borderPoints.indexOf(MapBorderPoint.AllPoints.indexOf(point)), 1);	
			MapProvince.AllProvinces.filter(mp => mp.Borders.some(b => b === this)).forEach(mp => mp.UpdatePoints());
			this.ReDraw();
		}

		public ReDraw(others: boolean = false): void {
			this.draw(others);
			SortStage();
		}

		private draw(others: boolean = false): void {
			if (this.graphic) this.graphic.destroy();
			this.graphic = new PIXI.Graphics();
			this.graphic.name = this.SameOwner ? "2_Subborder" : "3_Border";
			// this.graphic.filters = [Effects.SHADER];

			let widthToUse: number = (this.SameOwner || CurrentGame.EditorMode) ? 2 : 5;
			let colorToUse: number = CurrentGame.EditorMode ? 0x990000 : 0x000000;
			let seaBorder: boolean =
				MapProvince.AllProvinces
				.filter(mp => mp.Borders.some(b => b === this))
				.some(mp => mp.Terrain === "Sea" || mp.Terrain === "Deep sea");
			let sum: [number, number] = [0, 0];

			// Thick line needs two rounds
			for (let i = 0; i < (this.SameOwner || CurrentGame.EditorMode ? 1 : 2); i++) {
				if (i == 1) {
					colorToUse = 0xFF0000;
					widthToUse = 3;
				} 
				this.Points.forEach((p, i, a) => {
					this.graphic!.lineStyle(
						(p.invis || (i > 0 && a[i - 1].invis)) && !CurrentGame.EditorMode ? 0 : widthToUse,
						(p.invis || (i > 0 && a[i - 1].invis)) && CurrentGame.EditorMode ? 0x00AAAA : colorToUse,
						!CurrentGame.EditorMode && seaBorder ? 0.5 : !CurrentGame.EditorMode && this.SameOwner ? 0.2 : 1);
					i == 0 ? this.graphic!.moveTo(p.x, p.y) : this.graphic!.lineTo(p.x, p.y);
					sum[0] += p.x;
					sum[1] += p.y;
				});
			}
			if (CurrentGame.EditorMode) {
				this.graphic.lineStyle(0, 0, 0);
				this.graphic.beginFill(0x0000AA, 1);
				this.graphic.drawCircle(sum[0] / this.Points.length, sum[1] / this.Points.length, 7);
				this.graphic.endFill();
				this.Selectable = MakeSelectable(this.graphic, this);
			}
			Stage.addChild(this.graphic);

			if (others) MapProvince.AllProvinces.filter(mp => mp.Borders.some(b => b === this)).forEach(mp => mp.UpdatePoints());
		}
	}

	// This kinda extends BorderPoint
	// MapBorderPoint must always exist on a border, so no orphan points anywhere
	export class MapBorderPoint {
		public static AllPoints: MapBorderPoint[] = [];
		public static InitPoints(data: BorderPoint[]) { data.forEach(bp => new MapBorderPoint(bp)); }

		private graphic: PIXI.Graphics | undefined;

		get x(): number { return this.data[0]; }
		get y(): number { return this.data[1]; }

		get invis(): boolean { return this.data[2]; }
		set invis(t: boolean) { // Used only by editor
			this.data[2] = t;
			this.ReDraw(true);
			SortStage();
		}

		public static New(evt: PIXI.interaction.InteractionEvent): MapBorderPoint {
			let pos: PIXI.Point = evt.data.getLocalPosition(Stage);
			let data: BorderPoint = [pos.x, pos.y, false];
			CurrentGame.ProvinceSettings.points.push(data);
			return new MapBorderPoint(data);
		}

		constructor (private data: BorderPoint) {
			this.draw();
			MapBorderPoint.AllPoints.push(this);
		}

		// Destroy must handle removal in settings data too
		public Destroy() {
			if (CurrentGame.EditorMode) {
				let dataindex: number = CurrentGame.ProvinceSettings.points.indexOf(this.data);
				CurrentGame.ProvinceSettings.points.splice(dataindex, 1);
				MapBorderPoint.AllPoints.splice(MapBorderPoint.AllPoints.indexOf(this), 1);
				MapProvince.AllProvinces.forEach(mp => mp.Points = mp.Points.filter(p => p !== this));
				MapBorder.AllBorders.forEach(mb => {
					mb.data.borderPoints = mb.data.borderPoints.filter(bp => bp != dataindex).map(bp => bp > dataindex ? (bp - 1) : bp);
					mb.Points = mb.Points.filter(p => p !== this);
					mb.ReDraw(true);
				});
				this.graphic!.destroy(); // Should always exist if calling this
			}
		}

		public SetPosition(x: number, y: number) { // Used only by editor
			this.data[0] = Math.max(Math.min(x, CurrentGame.MapContainer.MaxX), 0) | 0;
			this.data[1] = Math.max(Math.min(y, CurrentGame.MapContainer.MaxY), 0) | 0;
			this.ReDraw(true);
			SortStage();
		}

		public ReDraw(others: boolean = false) {
			this.draw(others);
			SortStage();
		}

		private draw(others: boolean = false) {
			if (this.graphic) { // Remove old if necessary
				this.graphic.destroy();
				this.graphic = undefined;
			}
			if (!CurrentGame.EditorMode) return;

			this.graphic = new PIXI.Graphics();
			this.graphic.position.x = this.x;
			this.graphic.position.y = this.y;
			this.graphic.name = "4_BorderPoint";
			this.graphic.lineStyle(0);
			this.graphic.beginFill(this.invis ? 0x00FFFF : 0xFF0000, 0.85);
			this.graphic.drawCircle(0, 0, 4);
			this.graphic.endFill();
			Stage.addChild(this.graphic);

			MakeSelectable(this.graphic, this);
			MakeDraggable(this.graphic, this, (d: [number, number], g: PIXI.Point) => {
				this.graphic!.position.copy(g);
				this.SetPosition(g.x | 0, g.y | 0);
			});

      if (others) MapBorder.AllBorders.filter(b => b.Points.some(p => p === this)).forEach(b => b.ReDraw(true));
		}
	}
}