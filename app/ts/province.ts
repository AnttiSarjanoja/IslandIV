/// <reference path="army.ts" />
/// <reference path="drawable.ts" />
/// <reference path="player.ts" />
/// <reference path="../../server/interfaces.ts" />

class Province extends Drawable implements IProvince {
	private static readonly PICTURE: string = 'img/bunny.png';

	readonly id: number;
	readonly armies: Army[] = [];
	readonly size: number;
	readonly population: number;
	readonly resources: string[];

	public constructor(data : IProvince, x : number, y : number, color : PlayerColor) {
		super({image: Province.PICTURE, interactive: true});
		this.Container.x = x;
		this.Container.y = y;
		DrawableBase.Add(this.Container); // TODO: Move to loader
		this.changeTint(ColorToNumber(color));

		this.id = data.id;
		this.size = data.size;
		this.population = data.population;
		this.resources = data.resources;

		for (let army of data.armies) {
			let newArmy: Army = new Army(army, color);
			newArmy.Container.y = 30;
			this.armies.push(newArmy);
			this.AddToContainer(newArmy);
		}
	}
}