/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/draw_settings.ts" />
/// <reference path="input/draggable.ts" />
/// <reference path="input/selectable.ts" />
/// <reference path="army.ts" />
/// <reference path="order.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/unit_type.ts" />

// Single unit token e.g. 'one infantry'
namespace IslandIV {
	export class UnitToken extends Drawable {
		public Army: Army; // Current army

		get Province(): Province { return this.Army.Province; } // Can this ever be undefined?
		get Order(): Order | undefined { return this.Army.Order; }
		get Owner(): Player | undefined { return this.Province.Owner; }

		constructor (
			public readonly OriginalArmy: Army,
			public readonly Type: UnitType)
		{
			super({
				image: OriginalArmy.Province.Owner && PixiResources[OriginalArmy.Province.Owner.id + Type] ? OriginalArmy.Province.Owner.id + Type : Type,
				scale: TOKEN_SCALE
			}); 
			MakeSelectable(this.Container, this);
			MakeDraggable(this.Container, this, (d: [number, number], g: PIXI.Point, v: PIXI.Point) => {
				let province: Province | undefined = CurrentGame.GetProvinceUnder(v);
				if (province !== undefined && this.Province !== undefined) MoveOrder.Create(this.Province, province, this);
			});

			this.Army = this.OriginalArmy;
		}	
	}
}