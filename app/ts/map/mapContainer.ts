/// <reference path="mapDrawables.ts" />
/// <reference path="../game.ts" />
/// <reference path="../main.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

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

		constructor (game?: Game) {
			let tausta: PIXI.Sprite = new PIXI.Sprite(PixiResources['map'].texture); // TODO: Mb as parameter
			this.container.name = "0_map"; // Always at back
			this.container.addChild(tausta);
			this.container.interactive = true;

			this.container
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onPointerStart(evt))
				.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
				.on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
				.on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onPointerMove(evt));

			Stage.addChildAt(this.container, 0);

			this.Resize(); // Needs to be done once at first
		}

		private onPointerStart (evt : PIXI.interaction.InteractionEvent) {
			// TODO: Get pointerdata.button for different button interactions
			this.panning = true;
			this.previousPoint = evt.data.global.clone(); // Clones to not use same object, 

			console.log(evt.data.getLocalPosition(Stage));
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
		private get xMax(): number { return -Stage.width + Renderer.width; } // Easier to understand this way
		private get yMax(): number { return -Stage.height + Renderer.height; }

		private moveStage (x?: number, y?: number) {
			if (x !== undefined ) Stage.position.x = Math.min(Math.max(Stage.position.x + (x > 0 ? Math.ceil(x) : Math.floor(x)), this.xMax), 0);
			if (y !== undefined )	Stage.position.y = Math.min(Math.max(Stage.position.y + (y > 0 ? Math.ceil(y) : Math.floor(y)), this.yMax), 0);
		}
		// Centers the stage on given point
		public FocusStage(point: PIXI.Point) {
			let x: number = -point.x + (Renderer.width / 2);
			let y: number = -point.y + (Renderer.height / 2);
			Stage.position.x = Math.min(Math.max(x, this.xMax), 0) | 0;
			Stage.position.y = Math.min(Math.max(y, this.yMax), 0) | 0;
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
			Renderer.resize((window.innerWidth - 240) / this.canvasScale, (window.innerHeight) / this.canvasScale); /// 2 / 2
			Renderer.view.style.width = window.innerWidth - 240 + "px";
			Renderer.view.style.height = window.innerHeight + "px";
			Renderer.view.style.display = "block";
			Renderer.view.style.margin = "0";
		}
	}
}