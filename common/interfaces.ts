/// <reference path="player_color.ts" />
/// <reference path="unit_type.ts" />

// TODO: Users + pw
// IUser { inGame: IPlayer[]; } // All games are shown? But can only check out games that is a player in

interface IGame {
	name: string; // e.g. "Awesomegame6616"
	players: IPlayer[];
	messages: IMessage[];
	turn: number; // Current turn
	settingsFile: string; // "DefaultSettings.json" located in public/settings/
	provinceFile: string; // "DefaultProvinces.json" located in public/settings/
	religions: IReligion[];
}

interface IMessage {
	from: number; // Player "id"
	to: number[]; // Player "id", multiple recipients or none == all
	topic: string; // TODO: Unnecessary? Could just be chat-like
	text: string;
}

// NOTE: Is not same as login user! Is a game related instance of user
// This is what the player sees
interface IPlayer {
	id: number; // TODO: Is ok identifier? Could mb use name too

	color: PlayerColor;
	name: string; // e.g. "METRIN SLERBA"
	description: string; // e.g. "The pillar that is purity"
	orders: IOrder[];

	// Nation related
	provinces: IProvince[];
	gold: number;
	mp: number; // Magic points
	faith: number[]; // TODO: Really needs thinking, contains faith-points related to a specific religion
	techs: string[]; // TODO: Class or smth	
}

interface IOrder {
	turn: number; // Must match current to be valid? Otherwise is used as history of player orders?
	state: string; // TODO: Enum
	type: string; // TODO: Enum
	parameters: any[]; // TODO: Can we do anything better than this?
}

interface IReligion {
	name: string;
	description: string;
	bonuses: string[]; // TODO: Class or smth
}

interface IProvince {
	id: number; // Used in combination with config files // Should be unique!
	size: number; // Number of ppl allowed
	population: number; // Number of ppl // TODO: Is mixed population allowed?
	armies: IArmy[];
	resources: string[]; // TODO: Class or smth
}

interface IArmy {
	// UnitType is used in combination with config files
	units: UnitList;
}

type UnitList = { [unit in UnitType]?: number };