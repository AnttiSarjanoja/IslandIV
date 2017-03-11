/// <reference path="drawable.ts" />
/// <reference path="player.ts" />
/// <reference path="token.ts" />
/// <reference path="unit_type.ts" />
/// <reference path="../../server/interfaces.ts" />

class Unit extends Token implements IUnit {
	amount: number;
	type: UnitType; // Used in combination with config files

	constructor (data: IUnit, x: number, y: number, color: PlayerColor, container: PIXI.Container) {
		super(x, y, 'img/bunny.png', container, 0.4);
		this.changeTint(ColorToNumber(color));

		this.amount = data.amount;
		this.type = data.type;
	}
}