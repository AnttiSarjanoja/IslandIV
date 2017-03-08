/// <reference path="order.ts" />
/// <reference path="player_color.ts" />
/// <reference path="province.ts" />
/// <reference path="../../server/interfaces.ts" />

// Holds general information about the player. Any need for more complicated implementation?
class Player implements IPlayer {
	readonly id: number;
	readonly color: PlayerColor;
	readonly name: string;
	readonly description: string;
	readonly orders: Order[];

	readonly provinces: Province[];
	readonly gold: number;
	readonly mp: number;
	readonly faith: number[];
	readonly techs: string[];
	
	constructor(id: number, color: PlayerColor, name: string) {
		this.id = id;
		this.color = color;
		this.name = name;
	}
}