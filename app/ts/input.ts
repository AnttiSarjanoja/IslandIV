/// <reference path="../pixi-typescript/pixi.js.d.ts" />

/// <reference path="main.ts" />

class Input {
	// TODO: Rename ?
	private dragging : boolean = false;
	private pointClicked? : PIXI.Point;
	private pointNow? : PIXI.Point;
	private pointOrigin? : PIXI.Point;

	// Mb needed if canvas seems way too small for window
	// Acts as zoom level, decimals may *duck* things up by smoothing
	private canvasScale = 2;

	private container : PIXI.Container;
	private renderer : PIXI.WebGLRenderer | PIXI.CanvasRenderer;

	constructor(container : PIXI.Container, renderer : PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
		this.container = container;
		this.renderer = renderer;

		this.container
			.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onPointerStart(evt))
			.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
			.on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onPointerEnd(evt))
			.on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onPointerMove(evt));	
		document.addEventListener("keydown", (evt : KeyboardEvent) => this.handleEvt(evt));

		this.resize(); // Needs to be done once at first
		window.onresize = () => this.resize();
	}

	public handleEvt (evt : KeyboardEvent) {
		// DEBUG: console.log(evt.keyCode);
		switch(evt.keyCode) {
			// TODO: Ugly. But temporary
			case 37: this.moveContainer(5,0); break; // Left
			case 38: this.moveContainer(0,5); break; // Up
			case 39: this.moveContainer(-5,0); break; // Right
			case 40: this.moveContainer(0,-5); break; // Down
			case 171: this.canvasScale += 0.1; this.resize(); break; // '+'
			case 173: this.canvasScale -= 0.1; this.resize(); break; // '-'
		}
	}

	// TODO: Merge somehow with onPointerMove to handle going over edges
	// Prevent from going over edges
	private moveContainer (x : number = 0, y : number = 0) {
		this.container.position.x = Math.min(Math.max(this.container.position.x + x, -this.container.width + this.renderer.width), 0);
		this.container.position.y = Math.min(Math.max(this.container.position.y + y, -this.container.height + this.renderer.height), 0);
	}

	private onPointerStart (evt : PIXI.interaction.InteractionEvent) {
		// TODO: Get pointerdata.button for different button interactions
		this.dragging = true;
		this.pointClicked = evt.data.global.clone(); // Clones to not use same object
		this.pointNow = evt.data.global.clone();
		this.pointOrigin = new PIXI.Point();  // position is ObservablePoint which doesn't have clone :I // this.container.position.clone();
		this.pointOrigin.copy(this.container.position);
	}

	private onPointerEnd (evt : PIXI.interaction.InteractionEvent) {
		this.dragging = false;
	}

	private onPointerMove (evt : PIXI.interaction.InteractionEvent) {
		if (this.dragging) {
			if(this.pointNow === undefined ||
				this.pointClicked === undefined ||
				this.pointOrigin === undefined) return;

			// Get diff from current pointer location, restrict it to the size of this.container
			this.pointNow = evt.data.global.clone();
			let xChange = this.pointClicked.x - this.pointNow.x;
	  	let yChange = this.pointClicked.y - this.pointNow.y;
	  	this.container.position.x = Math.min(Math.max(this.pointOrigin.x - xChange, -this.container.width + this.renderer.width), 0);
	  	this.container.position.y = Math.min(Math.max(this.pointOrigin.y - yChange, -this.container.height + this.renderer.height), 0);
		}
	}

	private resize() {
		this.renderer.resize((window.innerWidth) / this.canvasScale, (window.innerHeight) / this.canvasScale); /// 2 / 2
		this.renderer.view.style.width = window.innerWidth + "px";
		this.renderer.view.style.height = window.innerHeight + "px";
		this.renderer.view.style.display = "block";
		this.renderer.view.style.margin = "0";
	}
}


