/// <reference path="army.ts" />
/// <reference path="main.ts" />
/// <reference path="input/input.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="map/mapDrawables.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />
/// <reference path="../../common/settings.ts" />

namespace IslandIV {
	export class Province extends Drawable implements IProvince {
		public static Picture: string = 'province'; // Default value

		// IProvince
		readonly id: number;
		readonly armies: Army[] = [];
		readonly size: number;
		readonly population: number;
		readonly resources: string[];

		get Name(): string { return this.settings.name; };
		get Neighbours(): ProvinceNeighbour[] { return this.settings.neighbours; }; // TODO: Separate for getting neighbour provinces vs settingsdata
		// get Points(): [number, number, boolean][] { return [].concat.apply([], this.settings.neighbours.map(n => n.borderPoints)); };
		get Color(): PlayerColor { return this.Owner ? this.Owner.color : "GRAY"; };

		public constructor(
			private readonly settings: ProvinceData,
			data: IProvince, 
			public readonly Owner?: Player) 
		{
			super({image: Province.Picture});

			new MapProvince(settings, this, CurrentGame.AllProvinces(), ColorToNumber(this.Color));
			this.Container.x = this.settings.x;
			this.Container.y = this.settings.y;
			Stage.addChild(this.Container);
			this.changeTint(ColorToNumber(this.Color));
			Input.SetProvinceInteractions(this);
			this.AddText(settings.name, 0, 30);

			// Go through data
			this.id = data.id;
			this.size = data.size;
			this.population = data.population;
			this.resources = data.resources;

			for (let army of data.armies) {
				let newArmy: Army = new Army(army, this.Color, this);
				newArmy.Container.x = this.settings.x; // TODO: Smarter way to do this, e.g. "addNewArmy()" in which y = y + 50 * i
				newArmy.Container.y = this.settings.y + 15;
				this.armies.push(newArmy);
				Stage.addChild(newArmy.Container);
			}
		}

		public static Dummy(settings: ProvinceData, id: number) {
			return new Province(settings, { id: id, size: 0, population: 0, resources: [], armies: [] });
		}

		// IMPORTANT NOTE: RemoveUnit is never needed since there should not be any situation where unit actually leaves its Province in GUI
		public AddToken(token: UnitToken) {
			this.armies[0].AddToken(token); // TEMP	
		}
	}
}