/// <reference path="drawable/drawable.ts" />
/// <reference path="token.ts" />
/// <reference path="unit_type.ts" />
/// <reference path="../../server/interfaces.ts" />

class Unit extends Token implements IUnit {
	public static Picture: string = 'unit'; // Default value

	amount: number;
	type: UnitType; // Used in combination with config files

	constructor (data: IUnit, color: PlayerColor) {
		super({image: Unit.Picture, scale: 0.4});
		this.SetInteractions(true);
		this.changeTint(ColorToNumber(color));

		this.amount = data.amount;
		this.type = data.type;
	}
}