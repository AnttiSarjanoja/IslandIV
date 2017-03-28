/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="input/input.ts" />
/// <reference path="input/mapContainer.ts" />
/// <reference path="drawable/drawableBase.ts" />
/// <reference path="loader.ts" />
/// <reference path="game.ts" />

// Style:
// Use tabs for indenting, no spaces
// KEEP EVERYTHING IN ENGLISH IN CODE FILES 
// weLikeCamels, not_this_at_all
// Use 'TODO: asdf' to show stuff needing fixing
// Use 'NOTE: asdf' to mention important stuff in comments
// Publics Uppercase, privates lowercase, _accessor _privates, CONST CAPS
// Singleline getters and setters are OK
// Operator and comma whitespaces (1 + 1, 2)
// Set first element of enum = 1 to avoid if(var) checking issues

document.body.onload = function () { IslandIV.Init(); };

// TODO: Namespace? (like PIXI.stuff)
// TODO: Rename base class
class IslandIV {
	private static version : string = "0.0";
	private static app : PIXI.Application = new PIXI.Application();
	private static _currentGame: Game;

	static get Game(): Game { return this._currentGame; }
	static set Game(game: Game) { this._currentGame = game; }
	
	public static Init() {
		console.log(this.app.renderer instanceof PIXI.WebGLRenderer ? "Right renderer" : "Using some slower renderer");

		// The below callback is called when all loading stuff has been done
		// TODO: Load-window :3
		Loader.Init(() => {
			document.body.appendChild(this.app.view);
			PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // NOTE: If this doesn't work, make sure pixi.js.d.ts is updated
			Input.Init(new MapContainer(this.app.stage, this.app.renderer)); // Mb save the container somewhere else?
			DrawableBase.Init(this.app.stage, this.app.ticker);
		});
	}
}
