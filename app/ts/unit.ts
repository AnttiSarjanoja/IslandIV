/// <reference path="drawable/drawable.ts" />
/// <reference path="token.ts" />
/// <reference path="order.ts" />
/// <reference path="unit_type.ts" />
/// <reference path="input/input.ts" />
/// <reference path="../../server/interfaces.ts" />

class Unit extends Token implements IUnit {
	public static Picture: string = 'unit'; // Default value

	readonly amount: number;
	readonly type: UnitType; // Used in combination with config files
	public Province: Province | null = null;
	public Army: Army | null = null;
	public Order: Order | null = null;

	constructor (data: IUnit, color: PlayerColor, province: Province, army: Army) {
		super({image: Unit.Picture, scale: 0.4});
		Input.SetTokenInteractions(this, true);
		this.changeTint(ColorToNumber(color));

		this.Province = province;
		this.Army = army;

		this.amount = data.amount;
		this.type = data.type;
	}
}