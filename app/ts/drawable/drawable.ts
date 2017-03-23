/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="effects.ts" />
/// <reference path="drawableBase.ts" />

// Base class for all drawable objects, such as units, effects, move-orders (?)
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// TODO: Namespace (do in main.ts first)
interface DrawableSprite {
	image: string,
	// centered?: boolean, // TODO: If needed
	x?: number, // Positions are used only for multisprite drawables
	y?: number,
	scale?: number
};

let font: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: ['Courier New', 'Courier', 'monospace'], // 'Courier New', Courier, monospace;
    fontSize: 12,
    fontWeight: 'bold',
    fill: '#000000',
    /*stroke: '#ffffff',
    strokeThickness: ,*/
    wordWrap: true,
    wordWrapWidth: 120
});

abstract class Drawable {
	// Let's assume that there can be multiple sprites contained by one Drawable
	private sprites: PIXI.Sprite[] = [];
	private _container: PIXI.Container = new PIXI.Container();

	get Container() : PIXI.Container {
		return this._container;
	}

	constructor(spritedata?: DrawableSprite) {
		if (spritedata !== undefined) {
			this.AddSprite(spritedata);
		}
	}

	// This truly centers the container even when sprite bounds go -x or -y
	public CenterContainer() {
		let bound: PIXI.Rectangle = this.Container.getLocalBounds();
		this.Container.pivot.x = bound.x + (bound.width / 2);
		this.Container.pivot.y = bound.y + (bound.height / 2);
	}

	public AddToContainer(drawable: Drawable) {
		this.Container.addChild(drawable.Container);
	}

	public AddText(text: string, x: number, y: number) {
		let newText: PIXI.Text = new PIXI.Text(text, font); // TODO: Fonts
		newText.anchor.set(0.5, 0.5);
		newText.x = x;
		newText.y = y;
		this.Container.addChild(newText);
	}

	// TODO: Mb one day use combined sprites to RenderTexture, which is used as images
	public AddSprite(spritedata: DrawableSprite) {
		let sprite: PIXI.Sprite = new PIXI.Sprite(DrawableBase.Resource[spritedata.image].texture);
		this.sprites.push(sprite);
		
		// All sprites must be centered for dragging to look nice
		sprite.anchor.set(0.5, 0.5);
		if (spritedata.x !== undefined) sprite.x = spritedata.x;
		if (spritedata.y !== undefined) sprite.y = spritedata.y;
		if (spritedata.scale !== undefined) sprite.scale.set(spritedata.scale, spritedata.scale);

		this.Container.addChild(sprite);
	}

	// Prolly obsolete
	// Pls use 0xFFFFFF like numbers
	protected changeTint(tint : number) : void {
		for (var sprite of this.sprites) {
			sprite.tint = tint;
		}
	}
}
