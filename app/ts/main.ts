/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="input/input.ts" />
/// <reference path="drawable/drawableBase.ts" />
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
	private static app : PIXI.Application = new PIXI.Application();
	private static MainContainer : PIXI.Container = new PIXI.Container(); // Must have separate container for scrolling
	
	public static Init() {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // NOTE: If this doesn't work, make sure pixi.js.d.ts is updated
		this.app.stage.addChild(this.MainContainer);
		console.log(this.app.renderer instanceof PIXI.WebGLRenderer ? "Right renderer" : "Using some slower renderer");
		Input.Init(this.app.stage, this.MainContainer, this.app.renderer);
		DrawableBase.Init(this.app.stage, this.app.ticker);
		Loader.Init(this.MainContainer); // TODO: Load-window :3
		document.body.appendChild(this.app.view);
	}
}
