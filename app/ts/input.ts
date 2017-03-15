/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="unit.ts" />

class Input {
	// General settings
	private static canvasScale = 2; // Acts as zoom level default

	// NOTE: Cannot merge these two since units etc. are added to stage, and children share same interactions
	private static stage: PIXI.Container; // This contains everything -> no interaction, just move if scrolled
	private static container: PIXI.Container; // This is the map container that has interaction stuff
	private static renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

	// Interaction temps
	private static dragging : boolean = false;
	private static pointClicked? : PIXI.Point;
	private static pointNow? : PIXI.Point;
	private static pointOrigin? : PIXI.Point;

	public static Init(stage: PIXI.Container, container: PIXI.Container, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
		if (stage === undefined || container === undefined || renderer === undefined) throw new Error("Input initiation error!");

		this.stage = stage;
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

	// General UI Input, affects everything
	private static resize() {
		this.renderer.resize((window.innerWidth) / this.canvasScale, (window.innerHeight) / this.canvasScale); /// 2 / 2
		this.renderer.view.style.width = window.innerWidth + "px";
		this.renderer.view.style.height = window.innerHeight + "px";
		this.renderer.view.style.display = "block";
		this.renderer.view.style.margin = "0";
	}

	public static handleEvt (evt : KeyboardEvent) {
		// DEBUG: console.log(evt.keyCode);
		switch(evt.keyCode) {
			// TODO: Ugly. But temporary
			case 37: this.setStagePos(this.stage.position.x + 5,); break; // Left
			case 38: this.setStagePos(undefined, this.stage.position.y + 5); break; // Up
			case 39: this.setStagePos(this.stage.position.x - 5,); break; // Right
			case 40: this.setStagePos(undefined, this.stage.position.y - 5); break; // Down
			case 171: this.canvasScale += 0.1; this.resize(); break; // '+'
			case 173: this.canvasScale -= 0.1; this.resize(); break; // '-'
		}
	}

	// Child specific UI Input
	public static UnitClicked (unit: Unit, evt: PIXI.interaction.InteractionEvent): void {
		if (evt.data.originalEvent instanceof MouseEvent) {

			// evt.data.originalEvent.shiftKey; // etc
			// 0 = leftie
			// 2 = rightie
		}
	}

	// Prevents from going over edges
	private static setStagePos (x? : number, y? : number) {
		if (x !== undefined ) this.stage.position.x = Math.min(Math.max(x, -this.stage.width + this.renderer.width), 0);
		if (y !== undefined )	this.stage.position.y = Math.min(Math.max(y, -this.stage.height + this.renderer.height), 0);
	}

	private static onPointerStart (evt : PIXI.interaction.InteractionEvent) {
		// TODO: Get pointerdata.button for different button interactions
		this.dragging = true;
		this.pointClicked = evt.data.global.clone(); // Clones to not use same object
		this.pointNow = evt.data.global.clone();
		this.pointOrigin = new PIXI.Point();  // position is ObservablePoint which doesn't have clone :I // this.container.position.clone();
		this.pointOrigin.copy(this.stage.position);

		console.log(evt.data.getLocalPosition(this.stage));
	}

	private static onPointerEnd (evt : PIXI.interaction.InteractionEvent) {
		this.dragging = false;
	}

	private static onPointerMove (evt : PIXI.interaction.InteractionEvent) {
		if (this.dragging) {
			if(this.pointNow === undefined ||
				this.pointClicked === undefined ||
				this.pointOrigin === undefined) return;

			// Get diff from current pointer location, restrict it to the size of this.container
			this.pointNow = evt.data.global.clone();
			let xChange = this.pointClicked.x - this.pointNow.x;
	  	let yChange = this.pointClicked.y - this.pointNow.y;
	  	this.setStagePos(this.pointOrigin.x - xChange, this.pointOrigin.y - yChange);
		}
	}
}
