/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../token.ts" />

class TokenInput {
	public static SetTokenInteractions (token: Token, drag: boolean = false) {
		new TokenInput(token, drag);
	}

	private dragged: boolean = false;
	private dragData: PIXI.interaction.InteractionData | null = null;
	private origPos: PIXI.Point | null = null;

	constructor (private token: Token, drag: boolean = false) {
		this.token.Container.interactive = true;
		this.token.Container.buttonMode = true;
		this.token.Container
			.on('pointerover', () => this.hoverOn())
			.on('pointerout', () => this.hoverOff());
		if (drag) {
			this.token.Container
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onDragStart(evt))
        .on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
        .on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
        .on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onDragMove(evt));
		}
	}

	private hoverOn() {
		if (this.dragged) return; // Avoid *duckery* when cursor moves off the object when dragging
		this.token.Container.filters = [Effects.RED_OUTLINE];
	}
	private hoverOff() {
		if (this.dragged) return; // Avoid *duckery* when cursor moves off the object when dragging
		this.token.Container.filters = [];
	}
	private onDragStart(evt : PIXI.interaction.InteractionEvent) {
		console.log("Dragstart");
		this.dragged = true;
		this.dragData = evt.data;
		this.token.Container.alpha = 0.5;
		this.origPos = new PIXI.Point();  // position is ObservablePoint which doesn't have clone :I // this.container.position.clone();
		this.origPos.copy(this.token.Container.position);
	}
	private onDragEnd(evt : PIXI.interaction.InteractionEvent) {
		console.log("Dragend"); // MAJOR TODO: Get province under dragging and make a order from it
		if (this.origPos) this.token.Container.position = this.origPos;
		this.dragged = false;
		this.dragData = null;
		this.token.Container.alpha = 1;
		this.hoverOff();
	}
	private onDragMove(evt : PIXI.interaction.InteractionEvent) {
		if (this.dragged && this.dragData !== null) {
			var newPosition = this.dragData.getLocalPosition(this.token.Container.parent);
			this.token.Container.x = newPosition.x;
			this.token.Container.y = newPosition.y;
		}
	}

}