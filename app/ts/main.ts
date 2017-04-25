/// <reference path="game.ts" />
/// <reference path="loader.ts" />
/// <reference path="ui.ts" />
/// <reference path="map/mapContainer.ts" />
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

namespace IslandIV {
	export const Version: string = "0.0";
	export const PIXIApp: PIXI.Application = new PIXI.Application();
	export const Stage: PIXI.Container = PIXIApp.stage;
	export const Renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer = PIXIApp.renderer;
	export const Ticker: PIXI.ticker.Ticker = PIXIApp.ticker;
	export const View: HTMLCanvasElement = PIXIApp.view;

	// Settings
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // MAJOR NOTE: Pls don't scale anything < 1 since we try to use pixel graphics without blending

	export let TickerTime: number = 0;
	export let PixiResources: PIXI.loaders.Resource;
	export let CurrentGame: Game; // The running game instance, mb someday switch between all games

	// Do stuff
	console.log(Renderer instanceof PIXI.WebGLRenderer ? "Right renderer" : "Using some slower renderer");
	Ticker.add(delta => TickerTime += delta);

	document.body.onload = () => IslandIV.Init();

	// TODO: Somehow sort in a better way
	export function SortStage() {
		Stage.children.sort((a, b) => a.name !== null && b.name !== null && a.name < b.name ? -1 : 1 );
	}

	export function Init() {
		UI.Loading();

		// Load stuff that are needed in every game
		// TODO: refactor if needed, is atm. kindof dummy hardcoded
		new PIXI.loaders.Loader('./shaders/')
			.add('shader', 'shader.frag')
			.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.Resource) =>
		{
			Effects.SHADER = new PIXI.Filter(undefined, resources['shader'].data, { 'iChannel0': { 'type': 'samplerXX', 'value': 10 }});

			// TODO: Load gamedata from multiple games?
			let gameLoader = new IslandIV.GameLoader(() => {
				if (!gameLoader.Validate) throw new Error("Loader failed :(");
				PixiResources = gameLoader.PixiResources!;
				new Game(gameLoader.GameData!, gameLoader.ProvinceSettings!, gameLoader.GameSettings!);
				UI.Game();
				setTimeout(() => { // Just to see stuff with a small delay, remove in the future
					CurrentGame.CreateMapContainer();
					CurrentGame.MapContainer.FocusStage(CurrentGame.CurrentPlayer.GetFocusCenter());
					UI.LoadingOff();
				}, 100);
			});
			gameLoader.Load();
		});
	}
}
