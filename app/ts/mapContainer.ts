/// <reference path="drawable/drawableBase.ts" />
/// <reference path="game.ts" />
/// <reference path="../pixi-typescript/pixi.js.d.ts" />

namespace IslandIV {
	// This class handles basically everything concerning Map-element and the window containing it
	// No sense to split into separate inputclass
	export class MapContainer {
		private container: PIXI.Container = new PIXI.Container();
		private canvasScale = 2; // Acts as zoom level default
		private asMapEditor: boolean = false;

		// Interaction temps
		private panning: boolean = false;
		private previousPoint? : PIXI.Point;

		constructor (
			// NOTE: Cannot use stage as container since units etc. are added to stage, and children share interactions
			private stage: PIXI.Container, // The non-interactive basecontainer, should be same size as container
			private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
			game?: Game) {

			let tausta: PIXI.Sprite = new PIXI.Sprite(DrawableBase.Resource['map'].texture);
			this.container.addChild(tausta);
			this.container.interactive = true;

			this.container
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onPointerStart(evt))
				.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
				.on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
				.on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onPointerMove(evt));

			if (game !== undefined) this.createBorders(game.AllProvinces());
			this.stage.addChildAt(this.container, 0);
			this.Resize(); // Needs to be done once at first
		}

		private createBorders(provinces: Province[], editormode: boolean = false) {
			// Clear old borders
			this.container.children = this.container.children.filter((child, index) => { if (index > 0) { child.destroy(); return false; } return true; });
			MapBorder.AllPoints = [];
			MapBorder.EditorMode = editormode;

			// Draw area for every province
			provinces.forEach(province => {
				if (province.Neighbours.some(n => n.borderPoints === undefined)) return; // TODO: Get rid when static data is validated in loader
				let points: [number, number, boolean][] = province.Points.filter( // Filter uniques
					(p, pos, a) => { return a.findIndex(pp => (p[0] == pp[0] && p[1] == pp[1])) == pos; });

				// Sort clockwise, thanks to @ciamej from stackoverflow
				let center: [number, number, boolean] =	points.reduce((p, c) => [p[0] + c[0], p[1] + c[1], false] ); // Sum
				center[0] = center[0] / points.length | 0;
				center[1] = center[1] / points.length | 0;

				// Magic
				points.sort((a, b) =>
				{
				    if (a[0] - center[0] >= 0 && b[0] - center[0] < 0) return -1;
				    if (a[0] - center[0] < 0 && b[0] - center[0] >= 0) return 1;
				    if (a[0] - center[0] == 0 && b[0] - center[0] == 0) {
				        if (a[1] - center[1] >= 0 || b[1] - center[1] >= 0) return a[1] > b[1] ? -1 : 1;
				        return b[1] > a[1] ? -1 : 1;
				    }

				    // compute the cross product of vectors (center -> a) x (center -> b)
				    let det: number = (a[0] - center[0]) * (b[1] - center[1]) - (b[0] - center[0]) * (a[1] - center[1]);
				    if (det < 0) return -1;
				    if (det > 0) return 1;

				    // points a and b are on the same line from the center
				    // check which point is closer to the center
				    let d1 = (a[0] - center[0]) * (a[0] - center[0]) + (a[1] - center[1]) * (a[1] - center[1]);
				    let d2 = (b[0] - center[0]) * (b[0] - center[0]) + (b[1] - center[1]) * (b[1] - center[1]);
				    return d1 > d2 ? -1 : 1;
				});

				// Draw the polygon
				let provincePoly = new PIXI.Graphics();
				provincePoly.beginFill(ColorToNumber(province.Color), 0.6);

				// draw a shape
				provincePoly.moveTo(points[points.length - 1][0], points[points.length - 1][1]);
				points.forEach(point => provincePoly.lineTo(point[0], point[1]));
				provincePoly.endFill();
				this.container.addChild(provincePoly);
			});
			this.container.addChild(new PIXI.Sprite(DrawableBase.Resource['map-mask'].texture));

			// Draw borders for every province
			// Thin line if same owner, otherwise thick red line with black outlining
			provinces.forEach((province, i) => {
				if (province.Neighbours.some(n => n.borderPoints === undefined)) return; // TODO: Get rid when static data is validated in loader
				province.Neighbours.forEach(n => {
					if (n.borderPoints.length > 0 && n.index !== null && n.index <= i) return; // Don't redraw already created borders
					new MapBorder(
						this.container,
						n.borderPoints,
						n.index === null || provinces.filter(p => p.id == n.index).some(p => p.Owner === province.Owner),
						ColorToNumber(province.Color)
					);
				});
			});
		}

		/*
		private drawBorder(borderPoints: [number, number, boolean][], sameOwner: boolean, color: number): PIXI.Graphics {
			let borderLine = new PIXI.Graphics();
			borderLine.lineStyle(
				sameOwner ? 1 : 5, // Thin line if same owner
				sameOwner ? color : 0x000000,
				1);
			for (let i = 0; i < (sameOwner ? 1 : 2); i++) { // Thick line needs two rounds
				if (i == 1) borderLine.lineStyle(3, 0xFF0000, 1);
				borderPoints.forEach((p, i) => i == 0 || p[2] ? borderLine.moveTo(p[0], p[1]) : borderLine.lineTo(p[0], p[1]));
				this.container.addChild(borderLine);
			}
			return borderLine;
		} */

		public InitMapEditor(provinces: Province[]) {
			this.createBorders(provinces, true);
		}

		private onPointerStart (evt : PIXI.interaction.InteractionEvent) {
			// TODO: Get pointerdata.button for different button interactions
			this.panning = true;
			this.previousPoint = evt.data.global.clone(); // Clones to not use same object, 

			console.log(evt.data.getLocalPosition(this.stage));
		}

		private onPointerEnd (evt : PIXI.interaction.InteractionEvent) {
			this.panning = false;
		}

		private onPointerMove (evt : PIXI.interaction.InteractionEvent) {
			if (!this.panning || this.previousPoint === undefined) return;
				
			// Get diff from current pointer location, restrict it to the size of this.container
			let curPoint: PIXI.Point = evt.data.global.clone();
			let xChange: number = curPoint.x - this.previousPoint.x;
	  	let yChange: number = curPoint.y - this.previousPoint.y;
	  	this.moveStage(xChange, yChange);

	  	this.previousPoint = curPoint.clone(); // Set new point after calculations
		}

		// Prevents from going over edges
		// The *duckery* in here is following: position cannot be over 0, and cannot be below -stage + renderer
		private get xMax(): number { return -this.stage.width + this.renderer.width; } // Easier to understand this way
		private get yMax(): number { return -this.stage.height + this.renderer.height; }

		private moveStage (x?: number, y?: number) {
			if (x !== undefined ) this.stage.position.x = Math.min(Math.max(this.stage.position.x + (x > 0 ? Math.ceil(x) : Math.floor(x)), this.xMax), 0);
			if (y !== undefined )	this.stage.position.y = Math.min(Math.max(this.stage.position.y + (y > 0 ? Math.ceil(y) : Math.floor(y)), this.yMax), 0);
		}
		// Centers the stage on given point
		public FocusStage(point: PIXI.Point) {
			let x: number = -point.x + (this.renderer.width / 2);
			let y: number = -point.y + (this.renderer.height / 2);
			this.stage.position.x = Math.min(Math.max(x, this.xMax), 0) | 0;
			this.stage.position.y = Math.min(Math.max(y, this.yMax), 0) | 0;
		}

		public handleEvt (evt: KeyboardEvent): boolean {
			switch(evt.keyCode) {
				case 37: this.moveStage( 5,  0); break; // Left
				case 38: this.moveStage( 0,  5); break; // Up
				case 39: this.moveStage(-5,  0); break; // Right
				case 40: this.moveStage( 0, -5); break; // Down
				case 171: this.canvasScale += 0.1; this.Resize(); break; // '+'
				case 173: this.canvasScale -= 0.1; this.Resize(); break; // '-'
				default: return false;
			}
			return true;
		}

		// General UI Input, affects everything
		public Resize() {
			// TODO: Get column widths from somewhere vs. this hardcoding
			this.renderer.resize((window.innerWidth - 240) / this.canvasScale, (window.innerHeight) / this.canvasScale); /// 2 / 2
			this.renderer.view.style.width = window.innerWidth - 240 + "px";
			this.renderer.view.style.height = window.innerHeight + "px";
			this.renderer.view.style.display = "block";
			this.renderer.view.style.margin = "0";
		}
	}

	/*
	interface BorderPoint {
		x: number,
		y: number,
		invis: boolean,
		borders: MapBorder[]
	}
	*/

	class BorderPoint {
		public x: number;
		public y: number;
		public invis: boolean;
		public borders: MapBorder[] = [];
		public graphic: PIXI.Graphics | undefined;
		private container: PIXI.Container;

		constructor (borderPoint: [number, number, boolean], editormode: boolean, container: PIXI.Container) {
			this.x = borderPoint[0];
			this.y = borderPoint[1];
			this.invis = borderPoint[2];
			this.container = container;
			if (editormode) this.Draw();
		}

		public Draw() {
			if (this.graphic) this.graphic.destroy();
			this.graphic = new PIXI.Graphics();
			this.graphic.lineStyle(1, 0xFF0000, 1);
			this.graphic.drawCircle(this.x, this.y, 10);
			this.container.addChild(this.graphic);
		}
	}

	class MapBorder {
		public static EditorMode: boolean = false;
		public static AllPoints: BorderPoint[] = [];
		private container: PIXI.Container;
		private graphic: PIXI.Graphics;
		public Points: BorderPoint[] = [];

		constructor (container: PIXI.Container, borderPoints: [number, number, boolean][], sameOwner: boolean, color: number) {
			this.container = container;
			this.Points = borderPoints.map(bp => {
				let pointToUse: BorderPoint | undefined = MapBorder.AllPoints.find(ap => ap.x == bp[0] && ap.y == bp[1]);
				if (pointToUse) pointToUse.borders.push(this);
				else {
					pointToUse = new BorderPoint(bp, MapBorder.EditorMode, container); // borders: [this] };
					MapBorder.AllPoints.push(pointToUse);
				}
				return pointToUse;
			});
			this.Draw(sameOwner, color);
		}

		public Draw(sameOwner: boolean, color: number): void {
			if (this.graphic) this.graphic.destroy();
			this.graphic = new PIXI.Graphics();
			this.graphic.lineStyle(
				sameOwner ? 1 : 5, // Thin line if same owner
				sameOwner ? color : 0x000000,
				1);
			for (let i = 0; i < (sameOwner ? 1 : 2); i++) { // Thick line needs two rounds
				if (i == 1) this.graphic.lineStyle(3, 0xFF0000, 1);
				this.Points.forEach((p, i) => i == 0 || p.invis ? this.graphic.moveTo(p.x, p.y) : this.graphic.lineTo(p.x, p.y));
				this.container.addChild(this.graphic);
			}
		}
	}
}