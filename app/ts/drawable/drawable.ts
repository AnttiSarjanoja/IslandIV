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
	align: 'center',
	fontFamily: ['GreekFont', 'Courier New', 'Courier', 'monospace'], // 'Courier New', Courier, monospace;
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
		this.Container.calculateBounds(); // Bounds won't update if nothing moves but e.g. something is removed
		let bound: PIXI.Rectangle = this.Container.getLocalBounds();
		this.Container.pivot.x = (bound.x + (bound.width / 2)) | 0;
		this.Container.pivot.y = (bound.y + (bound.height / 2)) | 0;
	}

	/* Obsolete?
	public AddToContainer(drawable: Drawable) {
		this.Container.addChild(drawable.Container);
	} */

	private setAnchor(obj: PIXI.Sprite | PIXI.Text) {
		obj.anchor.set(
			(obj.width / 2 | 0) / obj.width, // Needs bit of magic to work with SCALE_MODES.NEAREST
			(obj.height / 2 | 0) / obj.height
		);
	}

	public AddText(text: string, x: number, y: number) {
		let newText: PIXI.Text = new PIXI.Text(text, font); // TODO: Fonts
		this.setAnchor(newText);
		newText.x = x;
		newText.y = y;
		this.Container.addChild(newText);
	}

	// TODO: Atm only for 'Arrow'
	public AddGraphics(type: string, point: PIXI.Point, point2?: PIXI.Point) {
		if (point2 === undefined) return;
		let shadow: PIXI.Graphics = new PIXI.Graphics();
		shadow.lineStyle(3, 0x000000);
		shadow.moveTo(point.x, point.y);
		shadow.lineTo(point2.x, point2.y);
		this.Container.addChild(shadow);

		let arrow: PIXI.Graphics = new PIXI.Graphics();
		arrow.lineStyle(4, 0xFF0000);
		arrow.moveTo(point.x, point.y);
		arrow.quadraticCurveTo(
			0, -30, // Curve peak is always at x = 0
			point2.x,
			point2.y);
		arrow.drawEllipse(point2.x, point2.y, 12, 6);
		this.Container.addChild(arrow);
	}

	// TODO: Mb one day use combined sprites to RenderTexture, which is used as images
	public AddSprite(spritedata: DrawableSprite) {
		let sprite: PIXI.Sprite = new PIXI.Sprite(DrawableBase.Resource[spritedata.image].texture);
		this.sprites.push(sprite);
		
		// All sprites must be centered for dragging to look nice
		this.setAnchor(sprite);
		if (spritedata.x !== undefined) sprite.x = spritedata.x;
		if (spritedata.y !== undefined) sprite.y = spritedata.y;
		if (spritedata.scale !== undefined) sprite.scale.set(spritedata.scale, spritedata.scale);

		this.Container.addChild(sprite);
	}

	public GlowOn(): void {
		this.Container.filters = [Effects.RED_OUTLINE];
	}

	public GlowOff(): void {
		this.Container.filters = [];
	}

	// Prolly obsolete after proper images
	// Pls use 0xFFFFFF like numbers
	protected changeTint(tint : number) : void {
		// Go through whole PIXI object tree and change tints
		function recursiveTint(child: PIXI.DisplayObject, tint: number) {
			if (child instanceof PIXI.Sprite) {
				// PIXI.CanvasTinter.tintWithMultiply();
				child.tint = tint;
			}
			else if(child instanceof PIXI.Container) {
				for (var subchild of child.children) {
					recursiveTint(subchild, tint);
				}	
			}
		}
		recursiveTint(this.Container, tint);
	}
}
