/// <reference path="input/draggable.ts" />
/// <reference path="input/selectable.ts" />
/// <reference path="order.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/unit_type.ts" />

namespace IslandIV {
	// Single unit token e.g. 'one infantry'
	export class UnitToken extends Drawable {
		public static Picture: string = 'unit'; // Default value
		public Army: Army;

		get Province(): Province { return this.Army.Province; }
		get Order(): Order | null { return this.Army.Order; }

		constructor (
			public readonly OriginalArmy: Army,
			public readonly Type: UnitType)
		{
			super({
				image: UnitToken.Picture, // TODO: Get image through ownerplayer if not using tint
				scale: Type === "infantry" ? 0.4 : 0.6 // Just temp stuff to try out different units
			}); 
			MakeSelectable(this.Container, this);
			MakeDraggable(this.Container, this, (p: PIXI.Point, pp: PIXI.Point) => {
				let province: Province | undefined = CurrentGame.GetProvinceUnder(pp);
				if (province !== undefined && this.Province !== null) MoveOrder.Create(this.Province, province, this);
			});

			this.Army = this.OriginalArmy;
		}	
	}
}