/// <reference path="input/input.ts" />
/// <reference path="order.ts" />
/// <reference path="token.ts" />
/// <reference path="../../common/unit_type.ts" />

namespace IslandIV {
	// Single unit token e.g. 'one infantry'
	export class UnitToken extends Token {
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
			Input.SetTokenInteractions(this, true);
			this.Army = this.OriginalArmy;
		}	
	}
}