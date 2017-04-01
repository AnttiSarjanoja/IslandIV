/// <reference path="../common/interfaces.ts" />
/// <reference path="../common/settings.ts" />

// TODO: Now this is kind of copypaste of client-side Game atm. so is there any way to make this work with non-module solution?
export default class Game implements IGame {
	readonly name: string;
	readonly players: IPlayer[] = [];
	readonly messages: IMessage[] = [];
	readonly turn: number;
	readonly settingsFile: string = "";
	readonly provinceFile: string = "";
	readonly religions: IReligion[] = [];
	readonly neutralProvinces: IProvince[] = [];

	readonly ProvinceSettings: ProvinceSettings;
	readonly GameSettings: GameSettings;

	constructor(data: IGame, provinceSettings: ProvinceSettings, gameSettings: GameSettings) {
		this.name = data.name;
		this.turn = data.turn;
		this.settingsFile = data.settingsFile;
		this.provinceFile = data.provinceFile;

		// These work now :>
		this.ProvinceSettings = provinceSettings;
		this.GameSettings = gameSettings;

		// TODO: Classes for these
		this.players = data.players;
		this.messages = data.messages;
		this.religions = data.religions;
		this.neutralProvinces = data.neutralProvinces;

		/*
		for (var playerData of data.players) {
			this.players.push(new Player(playerData));	
		}
		Game.CurrentPlayer = this.players[0]; */
	}
}

