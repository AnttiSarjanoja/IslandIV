/// <reference path="order.ts" />
/// <reference path="player_color.ts" />
/// <reference path="province.ts" />
/// <reference path="../../server/interfaces.ts" />

// Holds general information about the player. Any need for more complicated implementation?
class Game implements IGame {
	readonly name: string;
	readonly players: IPlayer[];
	readonly messages: IMessage[];
	readonly turn: number;
	readonly settingsFile: string;
	readonly provinceFile: string;
	readonly religions: IReligion[];
}