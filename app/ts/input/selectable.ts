/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// This wraps a pixi displayobject with selectable input
namespace IslandIV {
	export function MakeSelectable (
		pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics,
		owner: any,
		cb?: (over: boolean) => void): Selectable
	{
		return new Selectable(pixiobj, owner, cb);
	}

	export class Selectable {
		private selected: boolean = false;

		// Kinda ugly but no other way to get hold of selectable without user interaction
		public static Latest: Selectable;

		public Children: Selectable[] = [];
		private isChildSelected: boolean = false;
		private startData: PIXI.Point;

		constructor (
			private pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics,
			private owner: any,
			private cb?: (over: boolean) => void)
		{
			Selectable.Latest = this;
			this.pixiobj.interactive = true;
			this.pixiobj.buttonMode = true;
			this.pixiobj
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.startData = evt.data.getLocalPosition(this.pixiobj.parent))
				.on('pointerover', () => this.hoverOn())
				.on('pointerout', () => this.hoverOff())
				.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.select(evt));
		}
		public Unselect() {
			this.pixiobj.filters = this.isChildSelected ? [Effects.SELECTED_CHILD_OUTLINE] : [];
			this.selected = false;
			this.Children.forEach(c => c && c.UnChildSelect()); // Ugly to use && as control
			Input.UnSelect(this.owner, this);
			if (this.cb) this.cb(false);
		}

		public ChildSelect() {
			this.isChildSelected = true; // if (this.pixiobj.filters && this.pixiobj.filters.length == 0) 
			this.pixiobj.filters = [Effects.SELECTED_CHILD_OUTLINE];
		}
		public UnChildSelect() {
			this.isChildSelected = false;
			this.pixiobj.filters = [];
		}

		private select(evt : PIXI.interaction.InteractionEvent) {
			if (!this.startData.equals(evt.data.getLocalPosition(this.pixiobj.parent))) return;
			if (this.selected) {
				this.Unselect();
			}
			else {
				this.selected = true;
				this.Children.forEach(c => c && c.ChildSelect()); // Ugly to use && as control
				this.pixiobj.filters = [Effects.SELECTED_OUTLINE];
				if (this.cb) this.cb(true);
				Input.Select(this.owner, this);
			}
		}

		private hoverOn() {
			if (this.selected || this.isChildSelected) return;
			this.pixiobj.filters = [Effects.HOVER_OUTLINE];
		}

		private hoverOff() {
			if (this.selected || this.isChildSelected) return;
			this.pixiobj.filters = [];
		}
	}
}