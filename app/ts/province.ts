/// <reference path="army.ts" />
/// <reference path="drawable.ts" />
/// <reference path="player.ts" />
/// <reference path="../../server/interfaces.ts" />

class Province extends Drawable implements IProvince {
	readonly id: number;
	readonly armies: Army[];
	readonly size: number;
	readonly population: number;
	readonly resources: string[];

	public constructor(data : IProvince, x : number, y : number, color : PlayerColor) {
		super(x, y, 'img/bunny.png');
		this.changeTint(ColorToNumber(color));

		this.id = data.id;
		this.size = data.size;
		this.population = data.population;
		this.resources = data.resources;

		for (let army of data.armies) {
			this.armies.push(new Army(army, color, this.Container));
		}
	}
}