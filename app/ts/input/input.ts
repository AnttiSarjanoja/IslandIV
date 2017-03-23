/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../unit.ts" />
/// <reference path="mapContainer.ts" />
/// <reference path="../order.ts" />
/// <reference path="tokenInput.ts" />

// Static class
abstract class Input {
	private static mapContainer: MapContainer;
	private static selected: Drawable[] = [];

	public static Init(stage: PIXI.Container, container: PIXI.Container, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
		if (stage === undefined || container === undefined || renderer === undefined) throw new Error("Input initiation error!");
		this.mapContainer = new MapContainer(container, stage, renderer);

		// TODO: Make a masterhandler to slice the correspondent keys for handlers in possible separate classes
		document.addEventListener("keydown", (evt : KeyboardEvent) => this.handleKeyDown(evt));
	}

	// TODO: Should work, just feels a bit shady. Could use a sorted array of handlers of (evt) => boolean
	private static handleKeyDown (evt: KeyboardEvent) {
		// Add all keyboard handlers 
		if (this.mapContainer.handleEvt(evt)) return;
		if (evt.keyCode === 83) Order.SendOrders(); // 's'
		else console.log("No handler for key '" + evt.key + "'");
	}

	// Child specific UI Input
	public static UnitClicked (unit: Unit, evt: PIXI.interaction.InteractionEvent): void {
		if (evt.data.originalEvent instanceof MouseEvent) {

			// evt.data.originalEvent.shiftKey; // etc
			// 0 = leftie
			// 2 = rightie
		}
	}

	public static Select (drawable: Drawable) {
		this.selected.push(drawable);
	}

	public static UnSelect (drawable: Drawable) {
		// TODO: this.selected.
	}

	public static ClearSelect () {
		this.selected = [];
	}
}
