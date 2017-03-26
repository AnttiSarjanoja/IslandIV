/// <reference path="player.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="unit.ts" />
/// <reference path="../../server/interfaces.ts" />

class Army extends Drawable implements IArmy {
	units: Unit[] = []; // Ehh, cannot be private :(

	public AddUnit(unit: Unit, updateContainer: boolean = true) {
		if (unit === undefined) throw new Error("Unit adding error!");
		this.units.push(unit);
		this.rearrangeUnits();
		this.Container.addChild(unit.Container);
		if (updateContainer) {
			this.CenterContainer();
		}
	}

	private rearrangeUnits() {
		this.units.forEach((unit: Unit, i: number) => {
			unit.Container.x = i * 6;
			unit.Container.y = 0; // Just to be sure
		});
	}

	public RemoveUnit(unit: Unit) {
		let index: number = this.units.indexOf(unit);
		if (index > -1) {
			unit.Container.x = 0; // Just to be sure
			unit.Container.y = 0;
			this.units.splice(index, 1);
			this.rearrangeUnits();
		}
		// this.Container.removeChild(unit.Container);
		this.CenterContainer();
	}

	public constructor(data: IArmy, color?: PlayerColor, province?: Province) {
		super(); // Does not have a basic picture

		if (color === undefined || province === undefined) return;
		for (var i = 0; i < data.units.length; i++) {
			let unit: IUnit = data.units[i];
			for (var j = 0; j < unit.amount; j++) {
				this.AddUnit(new Unit(unit, color, province), false); // Unit contains amount, this is somewhat messed up
			}
		}
		this.CenterContainer();
	}
}