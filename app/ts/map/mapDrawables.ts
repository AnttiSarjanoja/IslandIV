/// <reference path="../../../common/settings.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// These classes exist mostly for map editor uses only
namespace IslandIV {
	// Kinda extends ProvinceData
	export class MapProvince extends Drawable {
		/*public x: number; // Center-place for all units etc. not used in clockwise calculation though
		public y: number; 
		public text: string;
		public textRotate: number;
		public textScale: number; */
		public static AllProvinces: MapProvince[] = [];

		public terrain: Terrain;
		public borders: MapBorder[];

		private polygon: PIXI.Graphics; // Area
		private unitloc: PIXI.Graphics | undefined; // Unit position

		private color: number = 0xFFB6C1;
		public points: MapBorderPoint[]; // To help drawing
		public ArmyContainers: PIXI.Container[] = [];

		constructor (private data: ProvinceData, public Owner: Player | undefined) {
			super();
			this.Container.name = "1_Provincepoly";
			if (data.unit_x === undefined) data.unit_x = data.x;
			if (data.unit_y === undefined) data.unit_y = data.y;
			this.Container.position.x = data.unit_x;
			this.Container.position.y = data.unit_y;


			this.color = ColorToNumber(this.Owner ? this.Owner.color : "GRAY");
			this.borders = data.borders.map(n => MapBorder.AllBorders[n]);
			this.borders.forEach(b => {
				if (b.MapProvinces.find(mp => mp === this)) b.SameOwner = true;
				b.MapProvinces.push(this);
			});

			/*
				.filter(n => n.borderPoints !== undefined && n.borderPoints.length > 0)
				.map(pn => new MapBorder(
					pn,
					this,
					pn.index === null || allProvinces.filter(p => p.id == pn.index).some(p => p.Owner === province.Owner),
					color)); */

			// points: MapBorderPoint[]
			this.points = [].concat.apply([], this.borders.map(b => b.Points));
			this.points = this.points.filter( // Filter uniques
				(p, pos, a) => { return a.findIndex(pp => (p.x == pp.x && p.y == pp.y)) == pos; });

			// Sort clockwise, thanks to @ciamej from stackoverflow
			let center: [number, number] = [0, 0];
			this.points.forEach(p => { center[0] += p.x; center[1] += p.y; }); // Sum
			center[0] = center[0] / this.points.length | 0;
			center[1] = center[1] / this.points.length | 0;

			// Magic
			this.points.sort((a, b) =>
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
			Stage.addChild(this.Container);
			MapProvince.AllProvinces.push(this);
		}

		public Draw(): void {
			if (this.polygon) this.polygon.destroy();
			if (this.points.length <= 0) return;
			this.polygon = new PIXI.Graphics();
			this.polygon.name = "1_ProvincePoly";
			this.polygon.beginFill(CurrentGame.EditorMode ? 0x111111 : this.color, 0.6);
			this.polygon.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
			this.points.forEach(point => this.polygon.lineTo(point.x, point.y));
			this.polygon.endFill();
			this.polygon.blendMode = 2; // Multiply

			Stage.addChild(this.polygon);
			
			if (this.unitloc) {
				this.Container.removeChild(this.unitloc);
				this.unitloc.destroy();
				this.unitloc = undefined;
			}
			if (!CurrentGame.EditorMode) return;
			this.unitloc = new PIXI.Graphics();
			// this.unitloc.name = "2_UnitLoc";
			this.unitloc.lineStyle(0);
			this.unitloc.beginFill(0xFF0000, 0.85);
			this.unitloc.drawCircle(0, 0, 10);
			this.unitloc.endFill();

			MakeSelectable(this.unitloc, this);
			MakeDraggable(this.unitloc, this, (p: PIXI.Point, pp: PIXI.Point) => {
				this.unitloc!.position.copy(p);
				this.data.unit_x = pp.x | 0;
				this.data.unit_y = pp.y | 0;
				this.ArmyContainers.forEach(c => c.position.copy(pp)); // TODO: Different with many armies?
				// this.Draw();
				// SortStage();
			});
			this.Container.addChild(this.unitloc);

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

		constructor (data: ProvinceNeighbour) { //, sameOwner?: boolean, color?: number) {
			/*if (sameOwner) this.sameOwner = sameOwner;
			if (color !== undefined) this.color = color; */

			this.Points = data.borderPoints.map(bp => {
				let point: MapBorderPoint | undefined = MapBorderPoint.AllPoints[bp];
				if (point) point.borders.push(this);
				else throw new Error("Broken provincedata!");
				return point;
			});
			this.Draw();
			MapBorder.AllBorders.push(this);
		}

		public Draw(): void {
			if (this.graphic) this.graphic.destroy();
			this.graphic = new PIXI.Graphics();
			this.graphic.name = "2_Border";
			this.graphic.lineStyle(
				this.SameOwner || CurrentGame.EditorMode ? 1 : 5, // Thin line if same owner
				this.SameOwner ? this.Color : CurrentGame.EditorMode ? 0xFF0000 : 0x000000,
				1);
			for (let i = 0; i < (this.SameOwner || CurrentGame.EditorMode ? 1 : 2); i++) { // Thick line needs two rounds
				if (i == 1) this.graphic.lineStyle(3, 0xFF0000, 1);

				this.Points.forEach((p, i) => i == 0 || p.invis ? this.graphic.moveTo(p.x, p.y) : this.graphic.lineTo(p.x, p.y));
			}
			Stage.addChild(this.graphic);
		}
	}

	// This kinda extends BorderPoint
	// MapBorderPoint must always exist on a border, so no orphan points anywhere
	export class MapBorderPoint extends Drawable {
		public static AllPoints: MapBorderPoint[] = [];

		public borders: MapBorder[] = [];
		public graphic: PIXI.Graphics | undefined;

		// If in editormode, sprite must be interactive
		private dragged: boolean = false;
		private dragData: any;

		get x(): number { return this.data[0]; }
		set x(n: number) { this.data[0] = n; }

		get y(): number { return this.data[1]; }
		set y(n: number) { this.data[1] = n; }

		get invis(): boolean { return this.data[2]; }
		set invis(t: boolean) { this.data[2] = t; }

		public static InitPoints(data: BorderPoint[]) {
			data.forEach(bp => new MapBorderPoint(bp));
		}

		constructor (private data: BorderPoint) {
			super();

			this.Container.position.x = this.x;
			this.Container.position.y = this.y;
			this.Container.name = "3_BorderPoint";
			MakeSelectable(this.Container, this);
			MakeDraggable(this.Container, this, (p: PIXI.Point, pp: PIXI.Point) => {
				this.Container.position.copy(p);
				this.x = p.x | 0;
				this.y = p.y | 0;
				this.Draw(true);
				SortStage();
			});

			this.Draw(true);
			MapBorderPoint.AllPoints.push(this);
		}
		public Draw(others: boolean = false) {
			if (this.graphic) { // Remove old if necessary
				this.Container.removeChild(this.graphic);
				this.graphic.destroy();
				this.graphic = undefined;
			}
			if (!CurrentGame.EditorMode) return;

			this.graphic = new PIXI.Graphics();
			this.graphic.lineStyle(0);
			this.graphic.beginFill(0xFF0000, 0.85);
			this.graphic.drawCircle(0, 0, 4);
			this.graphic.endFill();

			this.Container.addChild(this.graphic);
			Stage.addChild(this.Container);

      if (others) this.borders.forEach(b => { b.Draw(); b.MapProvinces.forEach(mp => mp.Draw()); });
		}
	}
}