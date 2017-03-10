/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="input.ts" />
/// <reference path="drawable.ts" />
/// <reference path="loader.ts" />

// Style:
// Use tabs for indenting, no spaces
// KEEP EVERYTHING IN ENGLISH IN CODE FILES 
// weLikeCamels, not_this_at_all
// Use 'TODO: asdf' to show stuff needing fixing
// Use 'NOTE: asdf' to mention important stuff in comments
// Publics Uppercase, privates lowercase, _accessor _privates, CONST CAPS
// Operator and comma whitespaces (1 + 1, 2)
// Set first element of enum = 1 to avoid if(var) checking issues

document.body.onload = function () { IslandIV.Init(); };

// TODO: Namespace? (like PIXI.stuff)

// TODO: Rename base class
class IslandIV {
	private static version : string = "0.0";

	// NOTE: All code below is just a most basic PIXI app to show stuff
	private static app : PIXI.Application = new PIXI.Application();
	private static MainContainer : PIXI.Container = new PIXI.Container(); // Must have separate container for scrolling
	private static input : Input;
	// private static loader : Loader;
	
	public static Init() {
		// TODO: More sensible place for this
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // NOTE: If this doesn't work, make sure pixi.js.d.ts is updated

		this.app.stage.addChild(this.MainContainer);
		let renderer : PIXI.WebGLRenderer | PIXI.CanvasRenderer = this.app.renderer;
		this.input = new Input(this.MainContainer, this.app.renderer);
		// this.loader = new Loader();
		Drawable.Init(this.MainContainer);

		this.loadImages();
	}

	private static loadImages() {
		// TODO: Need dynamic loader, probably clone from QTL
		let loader : PIXI.loaders.Loader = new PIXI.loaders.Loader('./img/');
		loader.add('tausta', 'devmap.png');
		loader.add('bunny', 'bunny.png'); // TODO: Just temporary

		// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
		// loader.add(sprite_sheets_arr);

		loader.load((loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) => this.onLoad(loader, resources));
	}
	
	private static onLoad(loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) {
		let tausta = new PIXI.Sprite(resources['tausta'].texture);
		tausta.name = 'tausta';

		this.MainContainer.addChild(tausta);
		this.MainContainer.interactive = true;

		Loader.Init();

		// TODO: Is right place for this? Should be done after all loading etc.
		document.body.appendChild(this.app.view);
	}

	// NOTE: If any kind of clock is needed, use this kind of function
	// app.ticker.add(function() {
	//   DO STUFF HERE
	// });
}
