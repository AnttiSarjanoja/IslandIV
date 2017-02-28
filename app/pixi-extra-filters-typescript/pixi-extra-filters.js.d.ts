/// <reference path="../pixi-typescript/pixi.js.d.ts" />

// Type definitions for pixi-extra-filters
// Project: -- No at the moment --
// Definitions by: bigtimebuddy <https://github.com/pixijs/pixi-typescript>

// TODO: Make a githubproject for this

declare module PIXI {

	export module filters {

		export class OutlineFilter extends PIXI.Filter {
			constructor(width : number, color : number);
		}

		// TODO: Rest of the filters
	}
}