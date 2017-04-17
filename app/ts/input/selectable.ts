/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// This wraps a pixi displayobject with selectable input
namespace IslandIV {
	export function MakeSelectable (
		pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics,
		owner: any,
		cb?: (over: boolean) => void)
	{
		new Selectable(pixiobj, owner, cb);
	}

	export class Selectable {
		private selected: boolean = false;

		constructor (
			private pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics,
			private owner: any,
			private cb?: (over: boolean) => void)
		{
			this.pixiobj.interactive = true;
			this.pixiobj.buttonMode = true;
			this.pixiobj
				.on('pointerover', () => this.hoverOn())
				.on('pointerout', () => this.hoverOff())
				.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.select());
		}
		public Unselect() {
			this.pixiobj.filters = [];
			this.selected = false;
			if (this.cb) this.cb(false);
		}

		private select() {
			if (this.selected) {
				this.Unselect();
				Input.UnSelect(this.owner, this);
			}
			else {
				console.log("Imma selected!");
				this.selected = true;
				this.pixiobj.filters = [Effects.SELECTED_OUTLINE];
				if (this.cb) this.cb(true);
				Input.Select(this.owner, this);
			}
		}

		private hoverOn() {
			console.log("Hoveron");
			if (this.selected) return;
			this.pixiobj.filters = [Effects.HOVER_OUTLINE];
		}

		private hoverOff() {
			if (this.selected) return;
			this.pixiobj.filters = [];
		}
	}
}