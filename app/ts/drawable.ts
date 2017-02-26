/// <reference path="../pixi-typescript/pixi.js.d.ts" />

// Base class for all drawable objects, such as units, effects, move-orders
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// TODO: Namespace (do in main.ts first)
// TODO: Ok name?
// TODO: Abstract?
class Drawable {
	// TODO: Factory at lower classes, is here for testing purposes
	public static Create() {
		new Drawable(100, 100);
		new Drawable(200, 100);
	}

	private static container : PIXI.Container;

	public static Init(container : PIXI.Container) {
		this.container = container;
	}

	public static AddSprite(sprite : PIXI.Sprite) {
		this.container.addChild(sprite);
	}



	// var bunny = new PIXI.Sprite(texture);
	// TODO: Getter for this
	private sprite : PIXI.Sprite;

	// TODO: Interface instead of x / y + etc
	// TODO: Picture as parameter
	constructor(x : number, y : number) {
		this.sprite = PIXI.Sprite.fromImage('img/bunny.png'); // TODO: Should use loader resources
		this.sprite.anchor.set(0.5, 0.5); // Pic position is center of the image
		this.sprite.x = x;
		this.sprite.y = y;
		Drawable.AddSprite(this.sprite); // TODO: Is ok to place already in constructor?
		console.log(this.sprite);
	}
}