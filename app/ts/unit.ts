/// <reference path="drawable.ts" />
/// <reference path="player.ts" />
/// <reference path="token.ts" />
/// <reference path="unit_type.ts" />
/// <reference path="../../server/interfaces.ts" />

// NOTE: Probably needs drawable, or at least container for units
class Unit extends Token implements IUnit {
	amount: number;
	type: UnitType; // Used in combination with config files

	// TODO: Do we use factories?
	public static Create(x : number, y : number, color : PlayerColor) : Unit {
		let created : Unit = new Unit(x, y, 'img/bunny.png');
		created.changeTint(ColorToNumber(color));
		return created;
	}
}