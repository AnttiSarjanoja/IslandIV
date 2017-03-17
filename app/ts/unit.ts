/// <reference path="drawable.ts" />
/// <reference path="player.ts" />
/// <reference path="token.ts" />
/// <reference path="unit_type.ts" />
/// <reference path="../../server/interfaces.ts" />

class Unit extends Token implements IUnit {
	private static readonly PICTURE: string = 'img/bunny.png';

	amount: number;
	type: UnitType; // Used in combination with config files

	constructor (data: IUnit, color: PlayerColor) {
		super({image: Unit.PICTURE, interactive: true, scale: 0.4});
		this.changeTint(ColorToNumber(color));

		this.amount = data.amount;
		this.type = data.type;
	}
}