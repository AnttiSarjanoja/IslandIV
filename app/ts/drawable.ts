/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="effects.ts" />

// Base class for all drawable objects, such as units, effects, move-orders
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// Big TODO: Container for subdrawables e.g. units in army in province

// TODO: Namespace (do in main.ts first)
// TODO: Ok name?
abstract class Drawable {
	private static baseContainer : PIXI.Container; // The container into which all drawables are put

	public static Init(container : PIXI.Container) : void {
		this.baseContainer = container;
	}

	public static AddSprite(sprite : PIXI.Sprite) : void {
		this.baseContainer.addChild(sprite);
	}

	private hoverOn() {
		this._sprite.filters = [Effects.WHITE_OUTLINE];
	}

	private hoverOff() {
		this._sprite.filters = [];
	}

	// -- Non-statics --

	private _sprite : PIXI.Sprite;

	/* TODO: Actually, why should we ever give the sprite out?
	get Sprite() : PIXI.Sprite {
		return this._sprite;
	} */

	// Pls use 0xFFFFFF like numbers
	public changeTint(tint : number) : void {
		this._sprite.tint = tint;
	}

	// TODO: Interface instead of x / y + etc
	// TODO: Picture as parameter
	protected constructor(x : number, y : number, image : string) {
		this._sprite = PIXI.Sprite.fromImage(image); // TODO: Should use loader resources
		this._sprite.anchor.set(0.5, 0.5); // Pic position is center of the image
		this._sprite.x = x;
		this._sprite.y = y;
		Drawable.AddSprite(this._sprite); // TODO: Is ok to place already in constructor?

		// TODO: bad place for this
		this._sprite.interactive = true;
		this._sprite.on('pointerover', () => this.hoverOn())
        .on('pointerout', () => this.hoverOff());
	}
}