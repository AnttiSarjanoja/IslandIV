/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// Functions for generating PIXI.Graphics used by the game
// TODO: If optimization is ever needed, produce textures and render them with nearest neighbour and return sprites

namespace IslandIV {
	export namespace Shapes {
		export function EmptyPopulation(): PIXI.Graphics {
			let retVal: PIXI.Graphics = Population();
			retVal.alpha = 0.3;
			// retVal.blendMode = 2; // Multiply
			return retVal;
		}

		export function Population(color?: number): PIXI.Graphics {
			return new PIXI.Graphics()
				.beginFill(0x000000, 1)
				.drawCircle(0, 0, 5)
				.beginFill(color !== undefined ? color : 0x777777, 1)
				.drawCircle(0, 0, 4);
		}

		export function Infantry(color?: number): PIXI.Graphics {
			return new PIXI.Graphics()
				.beginFill(0x000000, 1)
				.drawRect(0, 0, 7, 11)
				.beginFill(color !== undefined ? color : 0x777777, 1)
				.drawRect(0, 0, 6, 10);
		}

		export function Cavalry(color?: number): PIXI.Graphics {
			return new PIXI.Graphics()
				.beginFill(0x000000, 1)
				.drawRect(0, 0, 9, 14)
				.beginFill(color !== undefined ? color : 0x777777, 1)
				.drawRect(0, 0, 8, 13);
		}

		// Spear
		export function Province(color?: number): PIXI.Graphics {
			return new PIXI.Graphics()
				.lineStyle(4, 0x000000, 1)
				.moveTo(0, -30)
				.lineTo(0, 30)
				.lineStyle(2, 0xAAAAAA, 1) //
				.moveTo(0, -29)
				.lineTo(0, 29);
		}

		export function Terrain(terrain: Terrain): PIXI.Graphics {
			let disc: PIXI.Graphics = terrainDisc();
			disc.name = "ProvinceTerrain";
			// disc.blendMode = 2;
			switch (terrain) {
				case "Plains": disc.addChild(plains()); break;
				case "Forest": disc.addChild(forest()); break;
				case "Hills": disc.addChild(hills()); break;
				case "Sea": disc.addChild(hills()); break;
				default: disc.addChild(hills()); break;
			}
			return disc;
		}
		function terrainDisc(): PIXI.Graphics {
			return new PIXI.Graphics()
				// .lineStyle(0)
				.beginFill(0x000000, 1)
				.drawEllipse(0, 10, 24, 8)
				.beginFill(0xFFFFFF, 1)
				.drawEllipse(0, 9, 24, 8);
		}
		function forest(): PIXI.Graphics {
			let retVal: PIXI.Graphics = new PIXI.Graphics();
			retVal.addChild(tree(-5, -5));
			retVal.addChild(tree(5, 0));
			return retVal;
		}
		function tree(x: number, y: number): PIXI.Graphics {
			let w: number = 7; // Width of tree
			let l: number = 6; // Length of trunk
			return new PIXI.Graphics()
				.lineStyle(1, 0x000000, 1)
				.beginFill(0xBBBBBB, 1)
				.drawCircle(x, y, w)
				.endFill()
				.moveTo(x, y + w)
				.lineTo(x, y + w + l);
		}
		function plains(): PIXI.Graphics {
			let retVal: PIXI.Graphics = new PIXI.Graphics();
			retVal.addChild(grass(0, 10));
			retVal.addChild(grass(-8, 8));
			retVal.addChild(grass(7, 5));
			return retVal;
		}
		function grass(x: number, y: number): PIXI.Graphics {
			return new PIXI.Graphics()
				.lineStyle(1, 0x000000, 1)
				.moveTo(x, y)
				.lineTo(x - 6, y - 5)
				.moveTo(x, y)
				.lineTo(x, y - 10)
				.moveTo(x, y)
				.lineTo(x + 4, y - 6);
		}
		function hills(): PIXI.Graphics {
			let retVal: PIXI.Graphics = new PIXI.Graphics();
			retVal.addChild(hill(-5, 7));
			retVal.addChild(hill(5, 12));
			return retVal;
		}
		function hill(x: number, y: number): PIXI.Graphics {
			return new PIXI.Graphics()
				.lineStyle(1, 0x000000, 1)
				.beginFill(0xBBBBBB, 1)
				.moveTo(x - 12, y)
				.quadraticCurveTo(x, y - 12, x + 12, y)
				.endFill();
		}

		// Arrow-like shape for showing map movements
		export function MapMoveArrow(startPoint: PIXI.Point, endPoint: PIXI.Point): PIXI.Graphics {
			return new PIXI.Graphics()
				.lineStyle(3, 0x000000, 0.7)
				.moveTo(startPoint.x, startPoint.y)
				.lineTo(endPoint.x, endPoint.y)
				.lineStyle(4, 0xFF0000)
				.moveTo(startPoint.x, startPoint.y)
				.quadraticCurveTo(0, -30, endPoint.x, endPoint.y) // Curve peak is always at x = 0
				.drawEllipse(endPoint.x, endPoint.y, 12, 6);
		}

	}	
}

