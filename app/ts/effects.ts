/// <reference path="../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../pixi-extra-filters-typescript/pixi-extra-filters.js.d.ts" />

// We also can use
// https://github.com/pixijs/pixi-filters
// Which already exists at
// "../pixi-typescript/pixi-filters.d.ts"

namespace Effects {
	export const WHITE_OUTLINE = new PIXI.filters.OutlineFilter(2, 0xFFFFFF);
	export const RED_OUTLINE = new PIXI.filters.OutlineFilter(2, 0xFF0000);
	// let whatsThis = new PIXI.filters.BloomFilter(); 
}