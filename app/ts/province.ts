/// <reference path="input/tokenInput.ts" />
/// <reference path="army.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="../../server/interfaces.ts" />

class Province extends Drawable implements IProvince {
	public static Picture: string = 'province'; // Default value

	readonly id: number;
	readonly armies: Army[] = [];
	readonly size: number;
	readonly population: number;
	readonly resources: string[];

	public constructor(data : IProvince, x : number, y : number, color : PlayerColor) {
		super({image: Province.Picture});
		this.Container.x = x;
		this.Container.y = y;
		DrawableBase.Add(this.Container); // TODO: Move to loader
		this.changeTint(ColorToNumber(color));
		TokenInput.SetTokenInteractions(this);
		this.AddText("Mehlandia 670", 0, 30);

		this.id = data.id;
		this.size = data.size;
		this.population = data.population;
		this.resources = data.resources;

		for (let army of data.armies) {
			let newArmy: Army = new Army(army, color);
			newArmy.Container.x = x; // TODO: Smarter way to do this
			newArmy.Container.y = y + 50;
			this.armies.push(newArmy);
			DrawableBase.Add(newArmy.Container);
		}
	}
}