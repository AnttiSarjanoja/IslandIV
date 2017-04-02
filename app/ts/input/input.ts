/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="mapContainer.ts" />
/// <reference path="../drawable/drawable.ts" />
/// <reference path="tokenInput.ts" />
/// <reference path="../order.ts" />

// Static class
abstract class Input {
	public static MapContainer: MapContainer;
	private static selected: Drawable[] = [];
	private static provinces: Drawable[] = []; // Needed for getting province under dragged sprite

	public static Init(map: MapContainer) {
		this.MapContainer = map;
		window.onresize = () => this.MapContainer.Resize();
		document.addEventListener("keydown", (evt : KeyboardEvent) => this.handleKeyDown(evt));
	}

	// TODO: Should work, just feels a bit shady. Could use a sorted array of handlers of (evt) => boolean
	private static handleKeyDown (evt: KeyboardEvent) {
		// Add all keyboard handlers 
		if (this.MapContainer.handleEvt(evt)) return;
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

	// TODO: Selection in here or in specific input-classes

	/*
	public static Select (drawable: Drawable) {
		this.selected.push(drawable);
	}

	public static UnSelect (drawable: Drawable) {
		// TODO: this.selected.
	}

	public static ClearSelect () {
		this.selected = [];
	}
	*/
}
