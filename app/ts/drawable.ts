/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="effects.ts" />

// Base class for all drawable objects, such as units, effects, move-orders (?)
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// TODO: Namespace (do in main.ts first)

// This is just static to contain stuff
abstract class DrawableBase {
	private static baseContainer: PIXI.Container; // The container into which all drawables are put
	private static ticker: PIXI.ticker.Ticker;

	public static Init(container: PIXI.Container, ticker: PIXI.ticker.Ticker) : void {
		if (container === undefined || ticker === undefined) throw new Error("Drawable initiation error!");
		this.baseContainer = container;
		this.ticker = ticker;
	}

	public static Add(drawable : PIXI.Sprite | PIXI.Container) : void {
		if (this.baseContainer === undefined || this.ticker === undefined) throw new Error("Drawable not initiated error!");
		this.baseContainer.addChild(drawable);
	}

	public static Ticker(fn: (delta: number) => void) {
		if (this.baseContainer === undefined || this.ticker === undefined) throw new Error("Drawable not initiated error!");
		this.ticker.add(fn);
	}
}

interface DrawableSprite {
	image: string,
	interactive: boolean,
	x?: number, // Positions are used only for multisprite drawables
	y?: number,
	scale?: number
};

abstract class Drawable {
	// Let's assume that there can be multiple sprites contained by one Drawable
	private sprites: PIXI.Sprite[] = [];
	private _container: PIXI.Container = new PIXI.Container();

	// If interactive
	private dragged: boolean = false;
	private origPos?: PIXI.Point;

	get Container() : PIXI.Container {
		return this._container;
	}

	constructor(spritedata?: DrawableSprite) {
		if (spritedata !== undefined) this.AddSprite(spritedata);
	}

	public AddToContainer(drawable: Drawable) {
		this.Container.addChild(drawable.Container);
		this.Container.pivot = new PIXI.Point(this.Container.width / 2, this.Container.height / 2);
	}

	// TODO: Mb one day use combined sprites to RenderTexture, which is used as images
	public AddSprite(spritedata: DrawableSprite) {
		let sprite: PIXI.Sprite = PIXI.Sprite.fromImage(spritedata.image); // TODO: Should use loader resources
		this.sprites.push(sprite);
		this.Container.addChild(sprite);

		sprite.anchor.set(0.5, 0.5); // TODO: Not sure why without this army container positions are *ducked*
		if (spritedata.x !== undefined) sprite.x = spritedata.x;
		if (spritedata.y !== undefined) sprite.y = spritedata.y;
		if (spritedata.scale !== undefined) sprite.scale.set(spritedata.scale, spritedata.scale);

		// TODO: Always use centered containers? Probably yes.
		this.Container.pivot = new PIXI.Point(this.Container.width / 2, this.Container.height / 2); 
		if (spritedata.interactive) this.interactions(sprite);
	}

	private interactions(sprite: PIXI.Sprite) {
		sprite.interactive = true;
		sprite.buttonMode = true;
		sprite
			.on('pointerover', () => this.hoverOn())
			.on('pointerout', () => this.hoverOff())
			.on('pointerdown', () => { console.log("Unit Clicked!"); });
	}

	private hoverOn() {
		for (var sprite of this.sprites) {
			sprite.filters = [Effects.RED_OUTLINE];
		}
	}
	private hoverOff() {
		for (var sprite of this.sprites) {
			sprite.filters = [];
		}
	}

	// Pls use 0xFFFFFF like numbers
	public changeTint(tint : number) : void {
		for (var sprite of this.sprites) {
			sprite.tint = tint;
		}
	}
}
