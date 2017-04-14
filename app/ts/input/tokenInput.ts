/// <reference path="../token.ts" />
/// <reference path="../ui.ts" />
/// <reference path="../../pixi-typescript/pixi.js.d.ts" />

namespace IslandIV {
	export class TokenInput {
		private dragged: boolean = false;
		private dragData: PIXI.interaction.InteractionData | null = null;
		private origPos: PIXI.Point | null = null;

		constructor (private token: Token, drag: boolean = false) {
			this.token.Container.interactive = true;
			this.token.Container.buttonMode = true;
			this.token.Container
				.on('pointerover', () => this.hoverOn())
				.on('pointerout', () => this.hoverOff());
			if (drag) {
				this.token.Container
					.on('pointerdown', (evt : PIXI.interaction.InteractionEvent) => this.onDragStart(evt))
	        .on('pointerup', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
	        .on('pointerupoutside', (evt : PIXI.interaction.InteractionEvent) => this.onDragEnd(evt))
	        .on('pointermove', (evt : PIXI.interaction.InteractionEvent) => this.onDragMove(evt));
			}
		}

		private hoverOn() {
			if (this.dragged) return; // Avoid *duckery* when cursor moves off the object when dragging
			this.token.GlowOn(); //.Container.filters = [Effects.RED_OUTLINE];
			if (this.token instanceof Province) UI.TextsToRight([this.token.Name, this.token.population.toString()]);
			else if (this.token instanceof UnitToken) UI.TextsToRight([this.token.Army.Province.Name, this.token.Type]);
		}

		private hoverOff() {
			if (this.dragged) return; // Avoid *duckery* when cursor moves off the object when dragging
			this.token.GlowOff();
		}

		private onDragStart(evt : PIXI.interaction.InteractionEvent) {
			// DEBUG: console.log("Dragstart");
			this.dragged = true;
			this.dragData = evt.data;
			this.token.Container.alpha = 0.5;
			this.origPos = new PIXI.Point();  // position is ObservablePoint which doesn't have clone :I // this.container.position.clone();
			this.origPos.copy(this.token.Container.position);
		}

		private onDragEnd(evt : PIXI.interaction.InteractionEvent) {
			// DEBUG: console.log("Dragend");
			if (this.dragged) {
				// Original position must be restored in all cases
				if (this.origPos) this.token.Container.position = this.origPos;
				this.token.Container.alpha = 1;

				let province: Province | null = Input.GetProvinceUnder(evt.data.global);
				if (province !== null) {
					// Tempstuff
					// DEBUG: console.log("Found " + province.id);
					if (this.token instanceof UnitToken && this.token.Province !== null) {
						MoveOrder.Create(this.token.Province, province, this.token);
					}
				}
			}
			this.dragged = false;
			this.dragData = null;
			this.hoverOff();
		}

		private onDragMove(evt : PIXI.interaction.InteractionEvent) {
			if (this.dragged && this.dragData !== null) {
				var newPosition = this.dragData.getLocalPosition(this.token.Container.parent);
				this.token.Container.x = newPosition.x;
				this.token.Container.y = newPosition.y;
			}
		}
	}
}