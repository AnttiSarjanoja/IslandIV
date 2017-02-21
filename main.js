/// <reference path="./pixi-typescript/pixi.js.d.ts" />
// Style:
// KEEP EVERYTHING IN CODE FILES ENGLISH
// weLikeCamels, not_this_at_all
// Use 'TODO: asdf' to show stuff needing fixing
// Use 'NOTE: asdf' to mention important stuff in comments
// Publics Uppercase, privates lowercase, _accessor _privates, CONST CAPS
// Operator and comma whitespaces (1 + 1, 2)
// Set first element of enum = 1 to avoid if(var) checking issues
var version = "0.0";
// NOTE: All code below is just a most basic PIXI app to show stuff
var app = new PIXI.Application();
var renderer = app.renderer;
document.body.appendChild(app.view);
// TODO: Need dynamic loader, probably clone from QTL
var loader = new PIXI.loaders.Loader('./img/');
loader.add('tausta', 'devmap.png');
// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
// loader.add(sprite_sheets_arr); 
loader.load(function (loader, resources) {
    var tausta = new PIXI.Sprite(resources['tausta'].texture);
    app.stage.addChild(tausta);
});
function handleEvt(evt) {
    console.log(evt.keyCode);
    switch (evt.keyCode) {
        // TODO: Ugly. But temporary
        case 37:
            app.stage.position.x += 5;
            break;
        case 38:
            app.stage.position.y += 5;
            break;
        case 39:
            app.stage.position.x -= 5;
            break;
        case 40:
            app.stage.position.y -= 5;
            break;
    }
}
;
document.addEventListener("keydown", handleEvt.bind(this));
// NOTE: If any kind of clock is needed
// app.ticker.add(function() {
//  DO STUFF
// })
// Mb needed if canvas seems way too small for window
// Acts as zoom level, decimals may *duck* things up by smoothing
var CANVAS_SCALE = 2;
// To unsmooth:
// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST
// TODO: Make rows below as a function and put into window.onresize()
// TODO: css or something that centers the canvas element
renderer.resize((window.innerWidth - 20) / CANVAS_SCALE, (window.innerHeight - 20) / CANVAS_SCALE); /// 2 / 2
renderer.view.style.width = window.innerWidth - 20 + "px";
renderer.view.style.height = window.innerHeight - 20 + "px";
// renderer.view.style.display = "block";
