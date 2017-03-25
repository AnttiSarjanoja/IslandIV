/// <reference path="input/input.ts" />
/// <reference path="army.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="token.ts" />
/// <reference path="../../server/interfaces.ts" />

class Province extends Token implements IProvince {
	public static Picture: string = 'province'; // Default value

	// IProvince
	readonly id: number;
	readonly armies: Army[] = [];
	readonly size: number;
	readonly population: number;
	readonly resources: string[];

	public constructor(
		private readonly x: number, // Must be saved for army placings 
		private readonly y: number,
		name: string,
		data: IProvince, 
		color: PlayerColor) 
	{
		super({image: Province.Picture});
		this.Container.x = this.x;
		this.Container.y = this.y;
		DrawableBase.Add(this.Container); // TODO: Move to loader
		this.changeTint(ColorToNumber(color));
		Input.SetProvinceInteractions(this);
		this.AddText(name, 0, 30);

		// Go through data
		this.id = data.id;
		this.size = data.size;
		this.population = data.population;
		this.resources = data.resources;

		for (let army of data.armies) {
			let newArmy: Army = new Army(army, color, this);
			newArmy.Container.x = this.x; // TODO: Smarter way to do this, e.g. "addNewArmy()" in which y = y + 50 * i
			newArmy.Container.y = this.y + 50;
			this.armies.push(newArmy);
			DrawableBase.Add(newArmy.Container);
		}
	}

	public RemoveUnit(unit: Unit) {
		this.armies[0].RemoveUnit(unit); // TEMP
	}
	public AddUnit(unit: Unit) {
		this.armies[0].AddUnit(unit); // TEMP	
	}
}