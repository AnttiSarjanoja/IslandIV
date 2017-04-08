/// <reference path="drawable/drawableBase.ts" />
/// <reference path="game.ts" />
/// <reference path="../pixi-typescript/pixi.js.d.ts" />

/*
drawBorder()
provinces.foreach
 if neighbour in drawedprovinces, return
 if neighbour owned -> ownborder, else thick
 drawedProvinces.push
*/

// This class handles basically everything concerning Map-element and the window containing it
// No sense to split into separate inputclass
class MapContainer {
	private container: PIXI.Container = new PIXI.Container();
	private canvasScale = 2; // Acts as zoom level default

	// Interaction temps
	private panning: boolean = false;
	private previousPoint? : PIXI.Point;
	
	constructor (
		// NOTE: Cannot use stage as container since units etc. are added to stage, and children share interactions
		private stage: PIXI.Container, // The non-interactive basecontainer, should be same size as container
		private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
		game: Game) {

		let tausta: PIXI.Sprite = new PIXI.Sprite(DrawableBase.Resource['map'].texture);
		this.container.addChild(tausta);
		this.container.interactive = true;

		this.container
			.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onPointerStart(evt))
			.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
			.on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
			.on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onPointerMove(evt));

		// Draw area for every province
		game.AllProvinces().forEach(province => {
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
			provincePoly.beginFill(ColorToNumber(province.Color), 0.5);

			// draw a shape
			provincePoly.moveTo(points[points.length - 1][0], points[points.length - 1][1]);
			points.forEach(point => provincePoly.lineTo(point[0], point[1]));
			provincePoly.endFill();
			this.container.addChild(provincePoly);
		});
		this.container.addChild(new PIXI.Sprite(DrawableBase.Resource['map-mask'].texture));

		// Draw borders for every province
		let createdIDs: number[] = [];
		game.AllProvinces().forEach((province, i, a) => {
			if (province.Neighbours.some(n => n.borderPoints === undefined)) return; // TODO: Get rid when static data is validated in loader
			province.Neighbours.forEach(n => {
				let borderLine = new PIXI.Graphics();
				borderLine.lineStyle(
					(province.Owner && province.Owner.provinces.map(p => p.id).some(id => id === n.index)) ? 1 : 4, // If same owner, thin line
					0xFF0000, 1); // TODO: Style by owner

				// TODO: Path cannot contain same point twice, is this the most pretty version of doing this?
				let firstpoint: [number, number, boolean] | undefined = n.borderPoints.shift();
				if (firstpoint) {
					borderLine.moveTo(firstpoint[0], firstpoint[1]);
					n.borderPoints.forEach(p => p[2] ? borderLine.moveTo(p[0], p[1]) : borderLine.lineTo(p[0], p[1]));
					this.container.addChild(borderLine);
				}
			});
		});
		this.stage.addChildAt(this.container, 0);
		this.Resize(); // Needs to be done once at first
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
