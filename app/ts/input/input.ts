/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../unit.ts" />
/// <reference path="mapContainer.ts" />
/// <reference path="../order.ts" />
/// <reference path="tokenInput.ts" />

// Static class
abstract class Input {
	private static mapContainer: MapContainer;
	private static selected: Drawable[] = [];
	private static provinces: Drawable[] = [];

	public static Init(stage: PIXI.Container, container: PIXI.Container, renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
		if (stage === undefined || container === undefined || renderer === undefined) throw new Error("Input initiation error!");

		renderer.plugins.interaction.autoPreventDefault = false;
		renderer.plugins.interaction.interactionFrequency = 1; // This doesn't work?

		this.mapContainer = new MapContainer(container, stage, renderer);

		document.addEventListener("keydown", (evt : KeyboardEvent) => this.handleKeyDown(evt));
	}

	// TODO: Should work, just feels a bit shady. Could use a sorted array of handlers of (evt) => boolean
	private static handleKeyDown (evt: KeyboardEvent) {
		// Add all keyboard handlers 
		if (this.mapContainer.handleEvt(evt)) return;
		if (evt.keyCode === 83) Order.SendOrders(); // 's'
		else console.log("No handler for key '" + evt.key + "'");
	}

	public static SetTokenInteractions (token: Token, drag: boolean = false) {
		new TokenInput(token, drag);
	}
	public static SetProvinceInteractions (token: Token) {
		new TokenInput(token);
		this.provinces.push(token);
	}
	public static GetProvinceUnder (point: PIXI.Point): Province | null { // TODO: Really temporary place
		let retVal: Province | null = null;
		this.provinces.forEach(function(province: Province) {
			let mainSprite: PIXI.DisplayObject = province.Container.getChildAt(0);
			if (mainSprite instanceof PIXI.Sprite && mainSprite.containsPoint(point)) {
				retVal = province;
			}
		});
		return retVal;
	}

	// TODO: Move to x-input.ts, Child specific UI Input
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
