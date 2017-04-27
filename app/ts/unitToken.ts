/// <reference path="input/draggable.ts" />
/// <reference path="input/selectable.ts" />
/// <reference path="order.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/unit_type.ts" />

namespace IslandIV {
	// Single unit token e.g. 'one infantry'
	export class UnitToken extends Drawable {
		// public static Picture: string = 'infantry'; // Default value
		public Army: Army;

		get Province(): Province { return this.Army.Province; }
		get Order(): Order | null { return this.Army.Order; }
		get Owner(): Player | undefined { return this.Province.Owner; }

		constructor (
			public readonly OriginalArmy: Army,
			public readonly Type: UnitType)
		{
			super({
				image: OriginalArmy.Province.Owner && PixiResources[OriginalArmy.Province.Owner.id + Type] ? OriginalArmy.Province.Owner.id + Type : Type,
				scale: 0.2 // Just temp stuff to try out different units
			}); 
			MakeSelectable(this.Container, this);
			MakeDraggable(this.Container, this, (d: [number, number], g: PIXI.Point, v: PIXI.Point) => {
				let province: Province | undefined = CurrentGame.GetProvinceUnder(v);
				if (province !== undefined && this.Province !== null) MoveOrder.Create(this.Province, province, this);
			});

			this.Army = this.OriginalArmy;
		}	
	}
}