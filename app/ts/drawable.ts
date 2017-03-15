/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="effects.ts" />

// Base class for all drawable objects, such as units, effects, move-orders (?)
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// TODO: Namespace (do in main.ts first)
abstract class Drawable {
	private static baseContainer : PIXI.Container; // The container into which all drawables are put

	public static Init(container : PIXI.Container) : void {
		if (container === undefined) throw new Error("Drawable initiation error!");
		this.baseContainer = container;
	}

	public static AddContainer(container : PIXI.Container) : void {
		this.baseContainer.addChild(container);
	}

	// -- Non-statics --
	private _sprite: PIXI.Sprite; // Write getter if needed
	private _container: PIXI.Container;

	// If _sprite.interactive
	private dragged: boolean = false;
	private origPos?: PIXI.Point;

	get Container() : PIXI.Container {
		return this._container;
	}

	// TODO: Interface instead of x / y + etc
	// TODO: Picture as parameter
	// TODO: Redo this whole container business
	constructor(x : number, y : number, image : string, container? : PIXI.Container, scale? : number) {
		this._sprite = PIXI.Sprite.fromImage(image); // TODO: Should use loader resources
		this._sprite.anchor.set(0.5, 0.5); // Pic position is center of the image
		
		if (scale) {
			this._sprite.scale.set(scale, scale);
		}

		if (container) {
			this._sprite.x = x;
			this._sprite.y = y;
			container.addChild(this._sprite);
		}
		else {
			this._container = new PIXI.Container();
			this._container.addChild(this._sprite);
			this._container.x = x;
			this._container.y = y;
			Drawable.AddContainer(this._container); // TODO: Is ok to place already in constructor?
		}

		// TODO: bad place for this
		this._sprite.interactive = true;
		this._sprite.buttonMode = true;
		this._sprite
			.on('pointerover', () => this.hoverOn())
			.on('pointerout', () => this.hoverOff())
			.on('pointerdown', () => { console.log("Unit Clicked!"); });
	}
	
	private hoverOn() {
		this._sprite.filters = [Effects.WHITE_OUTLINE];
	}
	private hoverOff() {
		this._sprite.filters = [];
	}

	// Pls use 0xFFFFFF like numbers
	public changeTint(tint : number) : void {
		this._sprite.tint = tint;
	}
}