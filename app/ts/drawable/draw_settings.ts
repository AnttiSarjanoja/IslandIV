/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../../../common/player_color.ts" />

namespace IslandIV {
	export const MAP_ZOOM_LEVEL: number = 2;

	export const ARMY_TOKEN_GAP: number = 12;

	export const TOKEN_SCALE: number = 0.2;

	export const PROVINCE_SCALE: number = 0.7;
	export const PROVINCE_ARMY_POS: number = 30;

	export const DEFAULT_COLOR: PlayerColor = "GRAY";
	export const ERROR_COLOR: PlayerColor = "ERROR";

	export const PROVINCE_FONT: PIXI.TextStyle = new PIXI.TextStyle({
		align: 'center',
		fontFamily: ['GreekFont', 'Courier New', 'Courier', 'monospace'],
		fontSize: 26,
		letterSpacing: 7,
		// fontWeight: 'bold',
		stroke: '#DDDDDD',
		strokeThickness: 2
		/*wordWrap: true,
		wordWrapWidth: 120 */
	});


}