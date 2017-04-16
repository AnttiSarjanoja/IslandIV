/// <reference path="../../../common/settings.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// These classes exist mostly for map editor uses only
namespace IslandIV {
	// Kinda extends ProvinceData
	export class MapProvince {
		public x: number; // Center-place for all units etc. not used in clockwise calculation though
		public y: number;
		public text: string;
		public textRotate: number;
		public textScale: number;
		public terrain: Terrain;
		public borders: MapBorder[];

		private graphic: PIXI.Graphics;
		private color: number = 0xFFB6C1;
		public points: MapBorderPoint[]; // To help drawing

		constructor (data: ProvinceData, province: Province, allProvinces: Province[], color: number) {
			this.color = color;

			this.borders = data.neighbours
				.filter(n => n.borderPoints !== undefined && n.borderPoints.length > 0)
				.map(pn => new MapBorder(
					pn,
					this,
					pn.index === null || allProvinces.filter(p => p.id == pn.index).some(p => p.Owner === province.Owner),
					color));

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
		}

		public Draw(): void {
			if (this.graphic) this.graphic.destroy();
			if (this.points.length <= 0) return;
			this.graphic = new PIXI.Graphics();
			this.graphic.name = "1_ProvincePoly";
			this.graphic.beginFill(CurrentGame.EditorMode ? 0x111111 : this.color, 0.6);
			this.graphic.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
			this.points.forEach(point => this.graphic.lineTo(point.x, point.y));
			this.graphic.endFill();
			this.graphic.blendMode = 2; // Multiply
			Stage.addChild(this.graphic);
		}
	}

	// Kinda extends ProvinceNeighbour
	export class MapBorder {
		// public static EditorMode: boolean = false;
		public static AllPoints: MapBorderPoint[] = [];
		public static AllBorders: MapBorder[] = [];

		// private ownerID: number; // OBSOLETE since sameOwner does the needed stuff
		private type: BorderType;
		public Points: MapBorderPoint[] = [];
		public MapProvince: MapProvince;

		private graphic: PIXI.Graphics;
		private sameOwner: boolean = false;
		private color: number = 0xFFB6C1;

		constructor (data: ProvinceNeighbour, mapProvince: MapProvince, sameOwner: boolean, color: number) {
			this.MapProvince = mapProvince;
			this.sameOwner = sameOwner;
			this.color = color;

			this.Points = data.borderPoints.map(bp => {
				let pointToUse: MapBorderPoint | undefined = MapBorder.AllPoints.find(ap => ap.x == bp[0] && ap.y == bp[1]);
				if (pointToUse !== undefined) pointToUse.borders.push(this);
				else {
					pointToUse = new MapBorderPoint(bp, CurrentGame.EditorMode, this);
					MapBorder.AllPoints.push(pointToUse);
				}
				return pointToUse;
			});
			this.Draw();
			MapBorder.AllBorders.push(this);
		}

		public Draw(): void {
			if (this.graphic) this.graphic.destroy();
			this.graphic = new PIXI.Graphics();
			this.graphic.name = "2_Border";
			this.graphic.lineStyle(
				this.sameOwner || CurrentGame.EditorMode ? 1 : 5, // Thin line if same owner
				this.sameOwner ? this.color : CurrentGame.EditorMode ? 0xFF0000 : 0x000000,
				1);
			for (let i = 0; i < (this.sameOwner || CurrentGame.EditorMode ? 1 : 2); i++) { // Thick line needs two rounds
				if (i == 1) this.graphic.lineStyle(3, 0xFF0000, 1);
				this.Points.forEach((p, i) => i == 0 || p.invis ? this.graphic.moveTo(p.x, p.y) : this.graphic.lineTo(p.x, p.y));
			}
			Stage.addChild(this.graphic);
		}
	}

	// This kinda extends BorderPoint
	// MapBorderPoint must always exist on a border, so no oprhan points anywhere
	export class MapBorderPoint {
		public x: number;
		public y: number;
		public invis: boolean;
		public borders: MapBorder[] = [];
		public graphic: PIXI.Graphics;

		// If in editormode, sprite must be interactive
		private dragged: boolean = false;
		private dragData: any;

		constructor (data: BorderPoint, editormode: boolean, border: MapBorder) {
			this.x = data[0];
			this.y = data[1];
			this.invis = data[2];
			this.borders.push(border);
			if (editormode) this.Draw(true);
		}
		public Draw(others: boolean = false) {
			if (this.graphic) this.graphic.destroy(); // Remove old if necessary
			this.graphic = new PIXI.Graphics();
			this.graphic.name = "3_BorderPoint";
			this.graphic.lineStyle(0);
			this.graphic.beginFill(0xFF0000, 0.85);
			this.graphic.drawCircle(this.x, this.y, 4);
			this.graphic.endFill();
			Stage.addChild(this.graphic);

			this.graphic.interactive = true;
			this.graphic
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onDragStart(evt))
        .on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
        .on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
        .on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onDragMove(evt));

      if (others) this.borders.forEach(b => { b.Draw(); b.MapProvince.Draw(); });
		}
		
		private onDragStart(evt : PIXI.interaction.InteractionEvent) {
			this.dragged = true;
			this.dragData = evt.data;
		}
		private onDragEnd(evt : PIXI.interaction.InteractionEvent) {
			if (this.dragged) {
				this.Draw(true);
				SortStage();
			}
			this.dragged = false;
			this.dragData = null;
		}
		private onDragMove(evt : PIXI.interaction.InteractionEvent) {
			if (this.dragged && this.dragData !== null) {
				let newPosition = this.dragData.getLocalPosition(this.graphic.parent);
				this.x = newPosition.x | 0;
				this.y = newPosition.y | 0;
				this.Draw(); // Not very efficient
			}
		}
	}
}