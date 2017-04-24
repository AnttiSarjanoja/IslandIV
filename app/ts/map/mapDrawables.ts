/// <reference path="../main.ts" />
/// <reference path="../input/draggable.ts" />
/// <reference path="../input/selectable.ts" />
/// <reference path="../../../common/settings.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// These classes exist mostly for map editor uses only
namespace IslandIV {
	// Kinda extends ProvinceData
	export class MapProvince {
		public static AllProvinces: MapProvince[] = [];

		public Terrain: Terrain;
		public Borders: MapBorder[];

		private polygon: PIXI.Graphics; // Area
		private unitloc: PIXI.Graphics | undefined; // Unit position

		private color: number = 0xFFB6C1;
		public Points: MapBorderPoint[]; // To help drawing
		public ArmyContainers: PIXI.Container[] = [];

		constructor (private data: ProvinceData, public Owner: Player | undefined) {
			if (data.unit_x === undefined) data.unit_x = data.x;
			if (data.unit_y === undefined) data.unit_y = data.y;

			this.color = ColorToNumber(this.Owner ? this.Owner.color : "GRAY");
			this.Borders = data.borders.map(n => MapBorder.AllBorders[n]);
			this.Borders.forEach(b => b.AddMapProvince(this));
			this.UpdateBorders();
			MapProvince.AllProvinces.push(this);
		}

		// Toggle
		public AddBorder(border: MapBorder): void {
			if (this.Borders.some(b => b === border)) this.RemoveBorder(border);
			console.log("Added border");
			border.AddMapProvince(this);
			this.Borders.push(border);
			this.data.borders.push(MapBorder.AllBorders.indexOf(border));
			this.UpdateBorders();
		}
		public RemoveBorder(border: MapBorder): void {
			if (!this.Borders.some(b => b === border)) return;
			console.log("Removed border");
			border.RemoveMapProvince(this);
			this.Borders.splice(this.Borders.indexOf(border), 1);
			this.data.borders.splice(this.data.borders.indexOf(MapBorder.AllBorders.indexOf(border)), 1);
			this.UpdateBorders();
		}

		public UpdateBorders(): void {
			this.Borders.forEach(b => b.SameOwner = b.MapProvinces.some(mp => mp !== this && mp.Owner === this.Owner));
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

			this.Draw();
		}

		public Draw(): void {
			if (this.polygon) this.polygon.destroy();
			if (this.Points.length > 0) {
				this.polygon = new PIXI.Graphics();
				this.polygon.name = "1_ProvincePoly";
				this.polygon.beginFill(CurrentGame.EditorMode ? 0x111111 : this.color, 0.6);
				this.polygon.moveTo(this.Points[this.Points.length - 1].x, this.Points[this.Points.length - 1].y);
				this.Points.forEach(point => this.polygon.lineTo(point.x, point.y));
				this.polygon.endFill();
				this.polygon.blendMode = 2; // Multiply

				Stage.addChild(this.polygon);
			}
			
			if (this.unitloc) {
				// Stage.removeChild(this.unitloc);
				this.unitloc.destroy();
				this.unitloc = undefined;
			}
			if (!CurrentGame.EditorMode) return;
			this.unitloc = new PIXI.Graphics();
			this.unitloc.name = "2_UnitLoc";
			this.unitloc.position.x = this.data.unit_x;
			this.unitloc.position.y = this.data.unit_y;
			this.unitloc.lineStyle(0);
			this.unitloc.beginFill(0xFF0000, 0.85);
			this.unitloc.drawCircle(0, 0, 10);
			this.unitloc.endFill();

			MakeSelectable(this.unitloc, this);
			MakeDraggable(this.unitloc, this, (p: PIXI.Point, pp: PIXI.Point) => {
				this.data.unit_x = Math.max(Math.min(pp.x, CurrentGame.MapContainer.MaxX), 0) | 0;
				this.data.unit_y = Math.max(Math.min(pp.y, CurrentGame.MapContainer.MaxY), 0) | 0;
				this.unitloc!.position.x = this.data.unit_x;
				this.unitloc!.position.y = this.data.unit_y;

				this.ArmyContainers.forEach(c => {
					c.position.x = this.data.unit_x;
					c.position.y = this.data.unit_y;
				}); // TODO: Different with many armies?
			});
			Stage.addChild(this.unitloc);
		}
	}

	// Kinda extends ProvinceNeighbour
	export class MapBorder {
		public static AllBorders: MapBorder[] = [];

		private type: BorderType;
		public Points: MapBorderPoint[] = [];
		public MapProvinces: MapProvince[] = [];
		public SameOwner: boolean = false;
		public Color: number = 0xFFB6C1;

		private graphic: PIXI.Graphics;

		public static InitBorders(data: ProvinceNeighbour[]) {
			data.forEach(pn => new MapBorder(pn));
		}

		public static New(): MapBorder {
			let data: ProvinceNeighbour = { borderPoints: [] };
			CurrentGame.ProvinceSettings.borders.push(data);
			return new MapBorder(data);
		}

		constructor (public data: ProvinceNeighbour) {
			this.Points = data.borderPoints.map(bp => {
				let point: MapBorderPoint | undefined = MapBorderPoint.AllPoints[bp];
				if (point) point.borders.push(this);
				else throw new Error("Broken provincedata: no Borderpoint in index " + bp);
				return point;
			});
			this.Draw();
			MapBorder.AllBorders.push(this);
		}

		public Clear(): void {
			this.Points.forEach(p => p.borders.splice(p.borders.indexOf(this), 1));
			this.Points = [];
			this.data.borderPoints = [];
			this.Draw();
			this.MapProvinces.forEach(mp => mp.UpdatePoints());
		}
		// Toggle
		public AddPoint(point: MapBorderPoint): void {
			if (this.Points.some(p => p === point)) {
				this.removePoint(point);
				return;
			}
			point.borders.push(this);
			this.Points.push(point);
			this.data.borderPoints.push(MapBorderPoint.AllPoints.indexOf(point));
			this.Draw();
			this.MapProvinces.forEach(mp => mp.UpdatePoints());
			SortStage();
		}
		private removePoint(point: MapBorderPoint): void {
			if (!this.Points.some(p => p === point)) return;
			point.borders.splice(point.borders.indexOf(this), 1);
			this.Points.splice(this.Points.indexOf(point), 1);
			this.data.borderPoints.splice(this.data.borderPoints.indexOf(MapBorderPoint.AllPoints.indexOf(point)), 1);	
			this.Draw();
			this.MapProvinces.forEach(mp => mp.UpdatePoints());
			SortStage();
		}
		// Non-Toggle
		public AddMapProvince(mapprovince: MapProvince): void {
			if (this.MapProvinces.some(mp => mp === mapprovince)) return; // this.RemoveMapProvince(mapprovince);
			this.MapProvinces.push(mapprovince);
		}
		public RemoveMapProvince(mapprovince: MapProvince): void {
			if (!this.MapProvinces.some(mp => mp === mapprovince)) return;
			this.MapProvinces.splice(this.MapProvinces.indexOf(mapprovince), 1);	
		}
		public Selectable: Selectable;
		public Draw(): void {
			if (this.graphic) this.graphic.destroy();
			this.graphic = new PIXI.Graphics();
			this.graphic.name = "3_Border";
			// this.graphic.filters = [Effects.SHADER];

			let widthToUse: number = (this.SameOwner || CurrentGame.EditorMode) ? 2 : 5;
			let colorToUse: number = CurrentGame.EditorMode ? 0x990000 : this.SameOwner ? this.Color : 0x000000;
			let sum: [number, number] = [0, 0];

			// Thick line needs two rounds
			for (let i = 0; i < (this.SameOwner || CurrentGame.EditorMode ? 1 : 2); i++) {
				if (i == 1) {
					colorToUse = 0xFF0000;
					widthToUse = 3;
				} 
				this.Points.forEach((p, i, a) => {
					this.graphic.lineStyle(
						(p.invis || (i > 0 && a[i - 1].invis)) && !CurrentGame.EditorMode ? 0 : widthToUse,
						(p.invis || (i > 0 && a[i - 1].invis)) && CurrentGame.EditorMode ? 0x00AAAA : colorToUse,
						1);
					i == 0 ? this.graphic.moveTo(p.x, p.y) : this.graphic.lineTo(p.x, p.y);
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
		}
	}

	// This kinda extends BorderPoint
	// MapBorderPoint must always exist on a border, so no orphan points anywhere
	export class MapBorderPoint {
		public static AllPoints: MapBorderPoint[] = [];

		public borders: MapBorder[] = [];
		public graphic: PIXI.Graphics | undefined;

		get x(): number { return this.data[0]; }
		get y(): number { return this.data[1]; }

		get invis(): boolean { return this.data[2]; }
		set invis(t: boolean) { // Used only by editor
			this.data[2] = t;
			this.Draw(true);
			SortStage();
		}

		public static InitPoints(data: BorderPoint[]) {
			data.forEach(bp => new MapBorderPoint(bp));
		}

		public static New(evt: PIXI.interaction.InteractionEvent): MapBorderPoint {
			let pos: PIXI.Point = evt.data.getLocalPosition(Stage);
			let data: BorderPoint = [pos.x, pos.y, false];
			CurrentGame.ProvinceSettings.points.push(data);
			return new MapBorderPoint(data);
		}

		constructor (private data: BorderPoint) {
			this.Draw(true);
			MapBorderPoint.AllPoints.push(this);
		}

		public Destroy() {
			if (CurrentGame.EditorMode) {
				let dataindex: number = CurrentGame.ProvinceSettings.points.indexOf(this.data);
				CurrentGame.ProvinceSettings.points.splice(dataindex, 1);
				MapBorderPoint.AllPoints.splice(MapBorderPoint.AllPoints.indexOf(this), 1);
				MapBorder.AllBorders.forEach(mb => mb.data.borderPoints = mb.data.borderPoints.filter(bp => bp != dataindex).map(bp => bp > dataindex ? (bp - 1) : bp));
				this.borders.forEach(b => b.AddPoint(this));
				this.graphic!.destroy(); // Should always exist if calling this
			}
		}

		public SetPosition(x: number, y: number) { // Used only by editor
			this.data[0] = Math.max(Math.min(x, CurrentGame.MapContainer.MaxX), 0) | 0;
			this.data[1] = Math.max(Math.min(y, CurrentGame.MapContainer.MaxY), 0) | 0;
			this.Draw(true);
			SortStage();
		}

		public Draw(others: boolean = false) {
			if (this.graphic) { // Remove old if necessary
				Stage.removeChild(this.graphic);
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
			MakeSelectable(this.graphic, this);
			MakeDraggable(this.graphic, this, (p: PIXI.Point, pp: PIXI.Point) => {
				this.graphic!.position.copy(p);
				this.SetPosition(p.x | 0, p.y | 0);
			});
			
			Stage.addChild(this.graphic);

      if (others) this.borders.forEach(b => { b.Draw(); b.MapProvinces.forEach(mp => mp.Draw()); });
		}
	}
}