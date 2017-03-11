/// <reference path="player.ts" />
/// <reference path="drawable.ts" />
/// <reference path="../../server/interfaces.ts" />

// NOTE: Probably needs drawable, or at least container for units
class Army implements IArmy {
	units: Unit[];

	public constructor(data : IArmy, color : PlayerColor, container : PIXI.Container) {
		for (let army of data.units) {
			for (var i = 0; i < army.amount; i++) {
				this.units.push(new Unit(data[i], 0 + i * 6 - army.amount * 2, 30, color, container)); // TODO: Ugly temp math, use centered container instead
			}
		}
	}
}