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

// TODO: save all game-related
export function SaveStuff(game : IGame) : void {
	db.collection('games'), function (error, games_c) {
		if(error) {
			console.error(error);
			return;
		}
		games_c.save(game);
	}
}

////////// Inits

export function InitAll() : void {
	runningPlayer = 0; 
	runningProvince = 0;
	SaveStuff(createGame());
}

export function createGame() : IGame {
	return {
		name: "Awesomegame6616",
		players: [createPlayer(), createPlayer()],
		messages: [],
		turn: 1,
		settingsFile: "settings/DefaultSettings.json",
		provinceFile: "settings/DefaultProvinces.json",
		religions: []
	}
}

let runningPlayer : number = 0;
function createPlayer() : IPlayer {
	runningPlayer += 1;
	return {
		id: runningPlayer,
		color: "RED",
		name: "METRIN SLERBA",
		description: "The pillar that is purity",
		orders: [],

		// Nation related
		provinces: [createProvince(), createProvince(), createProvince()],
		gold: 5,
		mp: 3,
		faith: [],
		techs: []
	}
}


let runningProvince : number = 0;
function createProvince() : IProvince {
	runningProvince += 1;
	return {
		id: runningProvince,
		size: 3,
		population: 1,
		armies: [createArmy()],
		resources: []
	}
}

function createArmy() : IArmy {
	return {
		units: [createUnit(), createUnit()]
	}
}

function createUnit() : IUnit {
	return {
		amount: 1,
		type: "infantry"
	}
}