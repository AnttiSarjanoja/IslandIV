/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

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

	public static RemoveTicker(fn: (delta: number) => void) {
		this.ticker.remove(fn);
	}
}
