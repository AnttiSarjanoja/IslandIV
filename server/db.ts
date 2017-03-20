/// <reference path="interfaces.ts" />
/// <reference path="../app/ts/unit_type.ts" />
/// <reference path="../app/ts/player_color.ts" />

// So using non-module .ts file cannot be integrated to this code?
// Feccckkkkk

// Mongodb
import * as mongodb from "mongodb";

let server : mongodb.Server = new mongodb.Server('localhost', 27017, {});
let db : mongodb.Db = new mongodb.Db('mydb', server, { w: 1 });
db.open(function() {});

// TODO: Works?
export function GetStuff(cb: (games: IGame[]) => void) {
	db.collection('games', function (error, games_c) {
		if(error) {
			console.error(error);
			return;
		}
		games_c.find().toArray(function(error, games) {
			cb(games);
		});
	});
}

// TODO: save all game-related, used by backend mechanics
export function SaveStuff(game: IGame) : void {
	db.collection('games'), function (error, games_c) {
		if(error) {
			console.error(error);
			return;
		}
		games_c.save(game);
	}
}

export function SaveOrders(orders: any[]) {

}

////////// Inits

export function InitAll() : void {
	SaveStuff(createGame());
}

export function createGame() : IGame {
	runningPlayer = 0; 
	runningProvince = 0;
	return {
		name: "Awesomegame6616",
		players: [createPlayer(6), createPlayer(6)],
		messages: [],
		turn: 1,
		settingsFile: "settings/DefaultSettings.json",
		provinceFile: "settings/DefaultProvinces.json",
		religions: []
	}
}

let runningPlayer : number = 0;
function createPlayer(provinceAmt : number) : IPlayer {
	runningPlayer += 1;
	let color: string = "ERROR";
	switch (runningPlayer) {
		case 1: color = "RED"; break;
		case 2: color = "GREEN"; break;
		case 3: color = "ORANGE"; break;
		case 4: color = "PURPLE"; break;
		case 5: color = "BLUE"; break;
		case 6: color = "YELLOW"; break;
	}
	let provinces : IProvince[] = [];
	for(var i = 0; i < provinceAmt; i++) {
		provinces.push(createProvince());
	}

	return {
		id: runningPlayer,
		color: color,
		name: "METRIN SLERBA",
		description: "The pillar that is purity",
		orders: [],

		// Nation related
		provinces: provinces,
		gold: 5,
		mp: 3,
		faith: [],
		techs: []
	}
}


let runningProvince: number = 0;
function createProvince(): IProvince {
	runningProvince += 1;
	return {
		id: runningProvince,
		size: 3,
		population: 1,
		armies: [createArmy(3)],
		resources: []
	}
}

function createArmy(unitAmount: number): IArmy {
	return {
		units: [createUnit(unitAmount)]
	}
}

function createUnit(amount: number): IUnit {
	return {
		amount: amount,
		type: "infantry"
	}
}