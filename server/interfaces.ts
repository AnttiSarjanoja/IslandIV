/// <reference path="../app/ts/player_color.ts" />
/// <reference path="../app/ts/unit_type.ts" />

// TODO: IGame-interface, used in multiple games at the same time

// S = schema
// TODO: Possibly rename
interface SPlayer<IdType> {
	_id: IdType;
	color: PlayerColor
	name: string;
}

interface SProvince<IdType> {
	_id: IdType;
	owner: SPlayer<IdType>;
	number: number; // Used in combination with config files
	armies: SArmy<IdType>[];
}

interface SArmy<IdType> {
	_id: IdType;
	owner: SPlayer<IdType>;
	units: SUnit<IdType>[];
}

interface SUnit<IdType> {
	_id: IdType;
	amount: number;
	type: UnitType; // Used in combination with config files
}

type IPlayer = SPlayer<string>;
type IProvince = SProvince<string>;
type IArmy = SArmy<string>;
type IUnit = SUnit<string>;
