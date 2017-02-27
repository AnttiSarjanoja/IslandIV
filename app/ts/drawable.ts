/// <reference path="../pixi-typescript/pixi.js.d.ts" />

// Base class for all drawable objects, such as units, effects, move-orders
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// TODO: Namespace (do in main.ts first)
// TODO: Ok name?
// TODO: Abstract?
class Drawable {
	private static container : PIXI.Container;

	public static Init(container : PIXI.Container) {
		this.container = container;
	}

	public static AddSprite(sprite : PIXI.Sprite) {
		this.container.addChild(sprite);
	}

	private _sprite : PIXI.Sprite;

	/* TODO: Actually, why should we ever give the sprite out?
	get Sprite() : PIXI.Sprite {
		return this._sprite;
	} */

	// Pls use 0xFFFFFF like numbers
	public changeTint(tint : number) {
		this._sprite.tint = tint;
	}

	// TODO: Interface instead of x / y + etc
	// TODO: Picture as parameter
	protected constructor(x : number, y : number) {
		this._sprite = PIXI.Sprite.fromImage('img/bunny.png'); // TODO: Should use loader resources
		this._sprite.anchor.set(0.5, 0.5); // Pic position is center of the image
		this._sprite.x = x;
		this._sprite.y = y;
		Drawable.AddSprite(this._sprite); // TODO: Is ok to place already in constructor?
	}
}