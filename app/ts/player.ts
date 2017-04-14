/// <reference path="main.ts" />
/// <reference path="order.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />

namespace IslandIV {
	// Holds general information about the player. Any need for more complicated implementation?
	export class Player implements IPlayer {
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

		// Gets the center point of all owned provinces
		public FocusCenter(): PIXI.Point {
			let xSum: number = 0;
			let ySum: number = 0;
			this.provinces.forEach(province => {
				xSum += province.Container.position.x;
				ySum += province.Container.position.y;
			});
			return new PIXI.Point(
				(xSum / this.provinces.length) | 0,
				(ySum / this.provinces.length) | 0,
			);
		}

		constructor(data: IPlayer, id: number, provinceSettings: ProvinceSettings) {
			this.id = id; // From game?
			this.color = data.color;
			this.name = data.name;
			this.description = data.description;
			
			this.gold = data.gold;
			this.mp = data.mp;
			this.faith = data.faith;
			this.techs = data.techs;

			data.provinces.forEach(provinceData =>
				this.provinces.push(new Province(provinceSettings.provinces[provinceData.id], provinceData, this))
			);

			// TODO: Generate instances
			// this.orders = data.orders; // History of orders, mb is unnecessary?
		}
	}
}