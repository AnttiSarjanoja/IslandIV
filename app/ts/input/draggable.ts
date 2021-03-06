/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

// This wraps a pixi displayobject with draggable properties
namespace IslandIV {
	export function MakeDraggable(
		pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics,
		owner: any,
		cb?: (delta: [number, number], global: PIXI.Point, view: PIXI.Point) => void): Draggable
	{
		return new Draggable(pixiobj, owner, cb);
	}
	// TODO: Does not work :(
	export function UnmakeDraggable (pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics) {
		pixiobj
			.off('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onDragStart(evt))
			.off('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
			.off('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
			.off('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onDragMove(evt));
	}

	export class Draggable {
		private dragged: boolean = false;
		private moved: boolean = false;
		private dragData: PIXI.interaction.InteractionData | null = null;
		private origPos: PIXI.Point | null = null;

		constructor (
			private pixiobj: PIXI.Container | PIXI.Sprite | PIXI.Graphics,
			private owner: any,
			private cb?: (delta: [number, number], global: PIXI.Point, view: PIXI.Point) => void)
		{
			this.pixiobj.interactive = true;
			this.pixiobj.buttonMode = true;
			this.pixiobj
				.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onDragStart(evt))
				.on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
				.on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
				.on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onDragMove(evt));
			this.pixiobj.listeners("pointerup").sort((a, b) => b === this.onDragEnd ? -1 : 1);
		}

		private onDragStart(evt : PIXI.interaction.InteractionEvent) {
			this.dragged = true;
			this.dragData = evt.data;
			this.pixiobj.alpha = 0.5;
			this.origPos = new PIXI.Point(); // position is ObservablePoint which doesn't have clone :I // this.container.position.clone();
			this.origPos.copy(this.pixiobj.position);
		}

		private onDragEnd(evt : PIXI.interaction.InteractionEvent) {
			if (this.dragged && this.dragData !== null && this.origPos !== null) {
				// Original position must be restored in all cases (?)
				this.pixiobj.position = this.origPos;
				this.pixiobj.alpha = 1;
				if (this.cb && this.moved) {
					let localPos: PIXI.Point = this.dragData.getLocalPosition(this.pixiobj.parent);
					this.cb([(localPos.x - this.origPos.x) | 0, (localPos.y - this.origPos.y) | 0], this.dragData.getLocalPosition(Stage), this.dragData.global);
					evt.stopPropagation();
				}
			}
			this.dragged = false;
			this.dragData = null;
			this.moved = false;
		}

		private onDragMove(evt : PIXI.interaction.InteractionEvent) {
			if (this.dragged && this.dragData !== null) {
				this.moved = true;
				var newPosition = this.dragData.getLocalPosition(this.pixiobj.parent);
				this.pixiobj.x = newPosition.x;
				this.pixiobj.y = newPosition.y;
			}
		}
	}
}