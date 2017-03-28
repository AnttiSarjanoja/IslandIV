/// <reference path="player.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/settings.ts" />

// Holds general information about the player. Any need for more complicated implementation?
class Game implements IGame {
	readonly name: string;
	readonly players: Player[] = [];
	readonly messages: IMessage[] = [];
	readonly turn: number;
	readonly settingsFile: string = "";
	readonly provinceFile: string = "";
	readonly religions: IReligion[] = [];

	readonly ProvinceSettings: ProvinceSettings;
	readonly GameSettings: GameSettings;

	constructor(data: IGame, provinceSettings: ProvinceSettings, gameSettings: GameSettings) {
		this.name = data.name;
		this.turn = data.turn;

		this.ProvinceSettings = provinceSettings;
		this.GameSettings = gameSettings;

		for (var playerData of data.players) {
			new Player(playerData);	
		}
	}
}