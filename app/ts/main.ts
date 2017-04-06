/// <reference path="game.ts" />
/// <reference path="loader.ts" />
/// <reference path="ui.ts" />
/// <reference path="drawable/drawableBase.ts" />
/// <reference path="input/input.ts" />
/// <reference path="mapContainer.ts" />
/// <reference path="../pixi-typescript/pixi.js.d.ts" />

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

namespace IslandIV {
	export const Version: string = "0.0";
	export const PIXIApp: PIXI.Application = new PIXI.Application();
	export let CurrentGame: Game; // The running game instance, mb someday switch between all games

	export function Init() {
		console.log(PIXIApp.renderer instanceof PIXI.WebGLRenderer ? "Right renderer" : "Using some slower renderer");
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // MAJOR NOTE: Pls don't scale anything < 1 since we try to use pixel graphics without blending
		DrawableBase.Init(PIXIApp.stage, PIXIApp.ticker);
		UI.Loading();

		// TODO: Load gamedata from multiple games?
		let gameLoader = new IslandIV.GameLoader(() => {
			if (!gameLoader.Validate) throw new Error("Loader failed :(");
			DrawableBase.Resource = gameLoader.PixiResources!;
			IslandIV.CurrentGame = new Game(gameLoader.GameData!, gameLoader.ProvinceSettings!, gameLoader.GameSettings!);
			UI.Game(PIXIApp.view);
			setTimeout(() => { // Just to see stuff with a small delay
				IslandIV.CurrentGame.CreateMapContainer(PIXIApp.stage, PIXIApp.renderer, IslandIV.CurrentGame.ProvinceSettings);
				IslandIV.CurrentGame.MapContainer.FocusStage(Game.CurrentPlayer.FocusCenter());
				UI.LoadingOff();
			}, 1000);
		});
		gameLoader.Load();
	}
}
