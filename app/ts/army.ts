/// <reference path="player.ts" />
/// <reference path="drawable.ts" />
/// <reference path="../../server/interfaces.ts" />

// NOTE: Probably needs drawable, or at least container for units
class Army implements IArmy {
	units: Unit[] = [];

	public constructor(data : IArmy, color : PlayerColor, container : PIXI.Container) {
		for (var i = 0; i < data.units.length; i++) {
			let unit: IUnit = data.units[i];
			for (var j = 0; j < unit.amount; j++) {
				this.units.push(new Unit(unit, 0 + j * 6 - unit.amount * 2, 30, color, container)); // TODO: Ugly temp math, use centered container instead
			}
		}
	}
}