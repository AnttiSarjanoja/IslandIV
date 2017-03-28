/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

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
		private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {

		let tausta: PIXI.Sprite = new PIXI.Sprite(DrawableBase.Resource['tausta'].texture);
		this.container.addChild(tausta);
		this.container.interactive = true;

		this.container
			.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onPointerStart(evt))
			.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
			.on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
			.on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onPointerMove(evt));

		this.stage.addChild(this.container);
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
	private moveStage (x: number, y: number) {
		let xMax: number = -this.stage.width + this.renderer.width; // Easier to understand this way
		let yMax: number = -this.stage.height + this.renderer.height;
		if (x !== undefined ) this.stage.position.x = Math.min(Math.max(this.stage.position.x + x, xMax), 0);
		if (y !== undefined )	this.stage.position.y = Math.min(Math.max(this.stage.position.y + y, yMax), 0);
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
		this.renderer.resize((window.innerWidth) / this.canvasScale, (window.innerHeight) / this.canvasScale); /// 2 / 2
		this.renderer.view.style.width = window.innerWidth + "px";
		this.renderer.view.style.height = window.innerHeight + "px";
		this.renderer.view.style.display = "block";
		this.renderer.view.style.margin = "0";
	}
}
