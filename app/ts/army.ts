/// <reference path="player.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="unit.ts" />
/// <reference path="../../server/interfaces.ts" />

class Army extends Drawable implements IArmy {
	units: Unit[] = [];

	public AddUnit(unit: Unit) {
		if (unit === undefined) throw new Error("Unit adding error!");
		this.units.push(unit);
		unit.Container.x = (this.units.length - 1) * 6;
		this.AddToContainer(unit);
	}

	public constructor(data: IArmy, color: PlayerColor) {
		super(); // Does not have a basic picture

		for (var i = 0; i < data.units.length; i++) {
			let unit: IUnit = data.units[i];
			for (var j = 0; j < unit.amount; j++) {
				this.AddUnit(new Unit(unit, color));
			}
		}
		this.CenterContainer();

		DrawableBase.Ticker((delta: number) => {
			this.Container.y -= Math.sin(DrawableBase.TickerTime / 2);
		});
	}
}