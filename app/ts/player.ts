/// <reference path="loader.ts" />
/// <reference path="order.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />


// Holds general information about the player. Any need for more complicated implementation?
class Player implements IPlayer {
	readonly color: PlayerColor;
	readonly name: string;
	readonly description: string;
	readonly orders: Order[] = [];

	readonly provinces: Province[] = [];
	readonly gold: number;
	readonly mp: number;
	readonly faith: number[] = [];
	readonly techs: string[] = [];
	
	readonly id: number;
	constructor(data: IPlayer, id: number) {
		this.id = id; // From game?
		this.color = data.color;
		this.name = data.name;
		this.description = data.description;
		
		this.gold = data.gold;
		this.mp = data.mp;
		this.faith = data.faith;
		this.techs = data.techs;

		for (var provinceData of data.provinces) {
			let obj = Loader.ProvinceSettings.provinces[provinceData.id];
			this.provinces.push(new Province(obj.x, obj.y, obj.name, obj.neighbours, provinceData, this.color));
		}

		// TODO: Generate instances
		// this.orders = data.orders; // History of orders, mb is unnecessary?
	}
}