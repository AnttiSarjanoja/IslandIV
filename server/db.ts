/// <reference path="../common/interfaces.ts" />
/// <reference path="../common/unit_type.ts" />
/// <reference path="../common/player_color.ts" />

import * as mongodb from "mongodb";
let server : mongodb.Server = new mongodb.Server('localhost', 27017, {});
let db : mongodb.Db = new mongodb.Db('mydb', server, { w: 1 });

db.on('open', function() {
	console.error("Opened connection to Mongo.");
});
db.on('close', function(err) {
	console.error('Connection to Mongo lost: %s', err);
});

export function Open(cb) {
	db.open(cb);
}

export function Close() {
	db.close();
}

// Gets all relevant gamedata from DB for initiating games to server
export function GetStuff(cb: (gameArray: IGame[]) => void) {
	db.collection('games', (error, games_c: mongodb.Collection) => {
		if(error) { console.error(error); return; }

		// No parameters to find since we want to load all games all the time
		games_c.find().toArray((error, games: IGame[]) => {
			if(error) { console.error(error); return; }

			if(games.length > 0) cb(games);
			else { InitAll(cb); } // TODO: Prolly shouldn't exist at some point
		});
	});
}

// TODO: save all game-related, used by backend mechanics
// NOTE: Will insert the new game if not existing!
export function UpdateGame(game: IGame, cb?: (games: IGame[]) => void): void {
	db.collection('games', (error, games_c: mongodb.Collection) => {
		if(error) { console.error(error); return; }
		games_c.update({ name: game.name }, game, { upsert: true }, (error, result) => {
				if(error) { console.error(error); return; }
			if(cb !== undefined) GetStuff(cb);
		});
	});
}

// NOTE: Orders are validated already at this point
// TODO: Right parameters, atm. are dummy values
export function SaveOrders(player: number, turn: number, orders: any[]) {
	console.log("From player: " + player + ", turn: " + turn); // TODO: Just a dummy
	console.log(JSON.stringify(orders)); // TODO: Just a dummy

	// TODO: Insert to correct game and player, should only append
}

// --- Initiating empty game ---

// TODO: Contain only dummy game to test out stuff, proper game initialisation values pls.
export function InitAll(cb: (games: IGame[]) => void) : void {
	console.log("Creating empty game");
	UpdateGame(createGame(), cb);
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
	let color: PlayerColor = "ERROR";
	switch (runningPlayer) {
		case 0: color = "RED"; break;
		case 1: color = "GREEN"; break;
		case 2: color = "ORANGE"; break;
		case 3: color = "PURPLE"; break;
		case 4: color = "BLUE"; break;
		case 5: color = "YELLOW"; break;
	}
	let provinces : IProvince[] = [];
	for(var i = 0; i < provinceAmt; i++) {
		provinces.push(createProvince());
		runningProvince += 1;
	}

	runningPlayer += 1;
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
	return {
		id: runningProvince,
		size: 3,
		population: 1,
		armies: [createArmy(3, 1)],
		resources: []
	}
}

function createArmy(infantryAmt: number, cavalryAmt: number): IArmy {
	return {
		units: {
			infantry: infantryAmt,
			cavalry: cavalryAmt,
			ship: 0
		}
	}
}
