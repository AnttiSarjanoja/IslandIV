/// <reference path="input/input.ts" />
/// <reference path="order.ts" />
/// <reference path="token.ts" />
/// <reference path="../../common/unit_type.ts" />

// Single unit token e.g. 'one infantry'
class UnitToken extends Token {
	public static Picture: string = 'unit'; // Default value
	public Army: Army;

	get Province(): Province { return this.Army.Province; }
	get Order(): Order | null { return this.Army.Order; }

	constructor (
		public readonly OriginalArmy: Army,
		public readonly Type: UnitType)
	{
		super({image: UnitToken.Picture, scale: 0.4}); // TODO: Get image through ownerplayer if not using tint
		Input.SetTokenInteractions(this, true);
		this.Army = this.OriginalArmy;
	}	
}