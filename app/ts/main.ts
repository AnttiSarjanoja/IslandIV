/// <reference path="../pixi-typescript/pixi.js.d.ts" />

// Style:
// Use tabs for indenting, no spaces
// KEEP EVERYTHING IN CODE FILES ENGLISH
// weLikeCamels, not_this_at_all
// Use 'TODO: asdf' to show stuff needing fixing
// Use 'NOTE: asdf' to mention important stuff in comments
// Publics Uppercase, privates lowercase, _accessor _privates, CONST CAPS
// Operator and comma whitespaces (1 + 1, 2)
// Set first element of enum = 1 to avoid if(var) checking issues

let version : string = "0.0";

// NOTE: All code below is just a most basic PIXI app to show stuff
let app : PIXI.Application = new PIXI.Application();
let MainContainer : PIXI.Container = new PIXI.Container(); // Must have separate container for scrolling
app.stage.addChild(MainContainer);
let renderer : PIXI.WebGLRenderer | PIXI.CanvasRenderer = app.renderer;
document.body.appendChild(app.view);

// TODO: Need dynamic loader, probably clone from QTL
let loader : PIXI.loaders.Loader = new PIXI.loaders.Loader('./img/');
loader.add('tausta', 'devmap.png');

// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
// loader.add(sprite_sheets_arr);

loader.load(function(loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) {
	let tausta = new PIXI.Sprite(resources['tausta'].texture);
	tausta.name = 'tausta';


	MainContainer.addChild(tausta);
	MainContainer.interactive = true;

	//tausta //app.stage.getChildByName('tausta')
	MainContainer.on('pointerdown', onPointerStart) // (evt : PIXI.interaction.InteractionEvent) => onPointerStart(evt))
				.on('pointerup', onPointerEnd)
				.on('pointerupoutside', onPointerEnd)
				.on('pointermove', onPointerMove); //('mousemove', onMouseMove);

	
});

function handleEvt (evt : KeyboardEvent) {
	console.log(evt.keyCode);
	switch(evt.keyCode) {
		// TODO: Ugly. But temporary
		case 37: MainContainer.position.x += 5; break;
		case 38: MainContainer.position.y += 5; break;
		case 39: MainContainer.position.x -= 5; break;
		case 40: MainContainer.position.y -= 5; break;
	}
};

document.addEventListener("keydown", handleEvt.bind(this));

// TODO: Move all UI interactions to a nice class or smth
// TODO: Rename when not globals
let dragging : boolean = false;
let pointClicked : PIXI.Point = null;
let pointNow : PIXI.Point = null;
let pointOrigin : PIXI.Point = null;

function onPointerStart (evt : PIXI.interaction.InteractionEvent) {
	// TODO: Get pointerdata.button for different button interactions
	dragging = true;
	pointClicked = evt.data.global.clone(); // Clones to not use same object
	pointNow = evt.data.global.clone();
	pointOrigin = new PIXI.Point();  // position is ObservablePoint which doesn't have clone :I // MainContainer.position.clone();
	pointOrigin.copy(MainContainer.position);
};

function onPointerEnd (evt : PIXI.interaction.InteractionEvent) {
	dragging = false;
};

function onPointerMove (evt : PIXI.interaction.InteractionEvent) {
	if (dragging) {
		// Get diff from current pointer location, restrict it to the size of MainContainer
		pointNow = evt.data.global.clone();
		let xChange = pointClicked.x - pointNow.x;
  	let yChange = pointClicked.y - pointNow.y;
  	MainContainer.position.x = Math.min(Math.max(pointOrigin.x - xChange, -MainContainer.width + renderer.width), 0);
  	MainContainer.position.y = Math.min(Math.max(pointOrigin.y - yChange, -MainContainer.height + renderer.height), 0);
	}
};

// NOTE: If any kind of clock is needed, use this kind of function
// app.ticker.add(function() {
// DO STUFF HERE
// });

// Mb needed if canvas seems way too small for window
// Acts as zoom level, decimals may *duck* things up by smoothing
const CANVAS_SCALE = 2;
// To unsmooth:
// TODO: NOTE: This is cuurently broken in pixi.js.d.ts :((( Should be "export var SCALE_MODE: number;" in that file
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// TODO: Make rows below as a function and put into window.onresize()
renderer.resize((window.innerWidth) / CANVAS_SCALE, (window.innerHeight) / CANVAS_SCALE); /// 2 / 2
renderer.view.style.width = window.innerWidth + "px";
renderer.view.style.height = window.innerHeight + "px";
renderer.view.style.display = "block";
renderer.view.style.margin = "0";
