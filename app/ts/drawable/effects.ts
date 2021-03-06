/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../../pixi-extra-filters-typescript/pixi-extra-filters.js.d.ts" />

// We also can use
// https://github.com/pixijs/pixi-filters
// Which already exists at
// "../pixi-typescript/pixi-filters.d.ts"

namespace IslandIV {
	export namespace Effects {
		export const WHITE_OUTLINE = new PIXI.filters.OutlineFilter(2, 0xFFFFFF);
		export const HOVER_OUTLINE = new PIXI.filters.OutlineFilter(1, 0xAA0000);
		export const SELECTED_OUTLINE = new PIXI.filters.OutlineFilter(2, 0xFF0000);
		export const SELECTED_CHILD_OUTLINE = new PIXI.filters.OutlineFilter(1, 0xFFFF00);

		export let SHADER: PIXI.Filter;
		// let whatsThis = new PIXI.filters.BloomFilter(); 
	}
}