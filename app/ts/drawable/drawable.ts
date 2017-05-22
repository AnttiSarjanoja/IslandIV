/// <reference path="shapes.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// Base class for all drawable objects, such as units, effects, move-orders (?)
// Basically this class exists to wrap all PIXI stuff, child classes will not understand PIXI stuff

namespace IslandIV {
	export interface DrawableSprite {
		image: string,
		name?: string,
		x?: number, // Positions are used only for multisprite drawables
		y?: number,
		scale?: number
	};
	// TODO: Prolly obsolete after proper images
	// Goes through whole PIXI object tree and changes tints
	// Pls use 0xFFFFFF like numbers
	export function ChangeTint(obj: PIXI.Container, tint: number): void {
		function recursiveTint(child: PIXI.Container, tint: number) {
			if (child instanceof PIXI.Sprite || child instanceof PIXI.Graphics) { child.tint = tint; }
			child.children.forEach(c => { if(c instanceof PIXI.Container) recursiveTint(c, tint); });
		}
		recursiveTint(obj, tint);
	}

	export class Drawable {
		private sprites: PIXI.Sprite[] = [];
		private _container: PIXI.Container = new PIXI.Container();

		get Container() : PIXI.Container { return this._container; }

		constructor(spritedata?: DrawableSprite) {
			this._container.name = "3_drawable";
			if (spritedata !== undefined) this.AddSprite(spritedata);
		}

		// This truly centers the container even when sprite bounds go -x or -y
		public CenterContainer(holdY: boolean = false, holdX: boolean = false) {
			this.Container.calculateBounds(); // Bounds won't update if nothing moves but e.g. something is removed
			let bound: PIXI.Rectangle = this.Container.getLocalBounds();
			if (!holdX) this.Container.pivot.x = (bound.x + (bound.width / 2)) | 0;
			if (!holdY) this.Container.pivot.y = (bound.y + (bound.height / 2)) | 0;
		}

		private setAnchor(obj: PIXI.Sprite | PIXI.Text) {
			obj.anchor.set(
				(obj.width / 2 | 0) / obj.width, // Looks better with images with small pixel amount than 0.5, 0.5
				(obj.height / 2 | 0) / obj.height
			);
		}

		public AddText(text: string, font: PIXI.TextStyle, x: number, y: number, r: number = 0, s: number = 1) {
			let newText: PIXI.Text = new PIXI.Text(text, font);
			this.setAnchor(newText);
			newText.name = "3_text";
			newText.x = x;
			newText.y = y;
			newText.scale.set(s, s);
			newText.rotation = r; // In radians
			this.Container.addChild(newText);
		}

		// TODO: Mb one day use combined sprites to RenderTexture, which is used as images
		public AddSprite(spritedata: DrawableSprite) {
			let sprite: PIXI.Sprite = new PIXI.Sprite(PixiResources[spritedata.image].texture);
			//	new PIXI.Sprite(PixiResources[spritedata.image].texture) :
			//	new PIXI.Sprite(PixiResources['bunny'].texture);
			this.sprites.push(sprite);
			
			// All sprites must be centered for dragging to look nice
			this.setAnchor(sprite);
			if (spritedata.name) sprite.name = spritedata.name;
			if (spritedata.x !== undefined) sprite.x = spritedata.x;
			if (spritedata.y !== undefined) sprite.y = spritedata.y;
			if (spritedata.scale !== undefined) sprite.scale.set(spritedata.scale, spritedata.scale);

			this.Container.addChild(sprite);
		}
	}
}