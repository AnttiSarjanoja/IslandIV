/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="effects.ts" />

// Base class for all drawable objects, such as units, effects, move-orders (?)
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

// TODO: Namespace (do in main.ts first)

// This is just static to contain stuff
abstract class DrawableBase {
	private static baseContainer: PIXI.Container; // The container into which all drawables are put
	private static ticker: PIXI.ticker.Ticker;
	public static Resource: PIXI.loaders.Resource;

	public static Init(container: PIXI.Container, ticker: PIXI.ticker.Ticker) : void {
		if (container === undefined || ticker === undefined) throw new Error("Drawable initiation error!");
		this.baseContainer = container;
		this.ticker = ticker;
		this.Ticker((delta: number) => {
			this._TickerTime += delta;
		});
	}

	public static Add(drawable : PIXI.Sprite | PIXI.Container) : void {
		if (this.baseContainer === undefined || this.ticker === undefined) throw new Error("Drawable not initiated error!");
		this.baseContainer.addChild(drawable);
	}

	private static _TickerTime: number = 0;
	static get TickerTime(): number {
		return this._TickerTime;
	}

	public static Ticker(fn: (delta: number) => void) {
		if (this.baseContainer === undefined || this.ticker === undefined) throw new Error("Drawable not initiated error!");
		this.ticker.add(fn);
	}
}

interface DrawableSprite {
	image: string,
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

	// If interactive
	private dragged: boolean = false;
	private dragData: PIXI.interaction.InteractionData | null = null;
	private origPos: PIXI.Point | null = null;

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
		
		sprite.anchor.set(0.5, 0.5); // TODO: Not sure why without this army container positions are *ducked*
		if (spritedata.x !== undefined) sprite.x = spritedata.x;
		if (spritedata.y !== undefined) sprite.y = spritedata.y;
		if (spritedata.scale !== undefined) sprite.scale.set(spritedata.scale, spritedata.scale);

		this.Container.addChild(sprite);
		// TODO: Always use centered containers? Probably yes.
		this.Container.pivot = new PIXI.Point(this.Container.width / 2, this.Container.height / 2); 
	}

	protected SetInteractions(draggable: boolean = false) {
		this.Container.interactive = true;
		this.Container.buttonMode = true;
		this.Container
			.on('pointerover', () => this.hoverOn())
			.on('pointerout', () => this.hoverOff());
		if (draggable) {
			this.Container
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onDragStart(evt))
        .on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
        .on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
        .on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onDragMove(evt));
		}
	}

	private hoverOn() {
		if (this.dragged) return; // Avoid *duckery* when cursor moves off the object when dragging
		this.Container.filters = [Effects.RED_OUTLINE];
	}
	private hoverOff() {
		if (this.dragged) return; // Avoid *duckery* when cursor moves off the object when dragging
		this.Container.filters = [];
	}
	private onDragStart(evt : PIXI.interaction.InteractionEvent) {
		console.log("Dragstart");
		this.dragged = true;
		this.dragData = evt.data;
		this.Container.alpha = 0.5;
		this.origPos = new PIXI.Point();  // position is ObservablePoint which doesn't have clone :I // this.container.position.clone();
		this.origPos.copy(this.Container.position);
	}
	private onDragEnd(evt : PIXI.interaction.InteractionEvent) {
		console.log("Dragend");
		if (this.origPos) this.Container.position = this.origPos;
		this.dragged = false;
		this.dragData = null;
		this.Container.alpha = 1;
		this.hoverOff();
	}
	private onDragMove(evt : PIXI.interaction.InteractionEvent) {
		if (this.dragged && this.dragData !== null) {
			var newPosition = this.dragData.getLocalPosition(this.Container.parent);
			this.Container.x = newPosition.x;
			this.Container.y = newPosition.y;
		}
	}

	// Prolly obsolete
	// Pls use 0xFFFFFF like numbers
	protected changeTint(tint : number) : void {
		for (var sprite of this.sprites) {
			sprite.tint = tint;
		}
	}
}
