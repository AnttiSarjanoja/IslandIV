/// <reference path="../common/interfaces.ts" />
/// <reference path="../common/unit_type.ts" />
/// <reference path="../common/player_color.ts" />

import * as mongodb from 'mongodb';
import * as fs from 'fs';

let server : mongodb.Server = new mongodb.Server('localhost', 27017, {});
let db : mongodb.Db = new mongodb.Db('mydb', server, { w: 1 });

db.on('open', function() { console.error("Opened connection to Mongo."); });
db.on('close', function(err) { console.error('Connection to Mongo lost: %s', err); });
export function Open(cb) { db.open(cb); }
export function Close() { db.close(); }

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

export function InitAll(cb: (games: IGame[]) => void): void {
	console.log("Creating empty game");
	let newGame: IGame | null = CreateGame(
		"Awesomegame6616",
		"DefaultSettings.json",
		"DefaultProvinces.json",
		"DefaultInitData.json"
	);
	if (newGame) UpdateGame(newGame, cb);
	else cb([]);
}

// --- Creating empty game ---

function gameCreationError(name: string, error: any) {
	console.log("Error creating a new game: '" + name + "'");
	console.log("  Reason: " + error);
}

// Megafunction
// 1) Load given files
// 2) Validate given files
// 3) Create everything from given data

export function CreateGame(name: string, settingsFile: string, provinceFile: string, initFile: string): IGame | null {
	let provinceSettings: ProvinceSettings; // This is loaded only to check validity to initData
	let gameSettings: GameSettings; // Unit prices, powers etc.
	let initData: InitData; // Data for creating provinces and starting positions
	
	// File loading may throw errors
	try {
		provinceSettings = JSON.parse(fs.readFileSync(__dirname + '/public/settings/' + provinceFile, 'utf8'));
		gameSettings = JSON.parse(fs.readFileSync(__dirname + '/public/settings/' + settingsFile, 'utf8'));
		initData = JSON.parse(fs.readFileSync(__dirname + '/public/settings/' + initFile, 'utf8'));
	}
	catch (e) {
		gameCreationError(name, e);
		return null;
	}
	// Validation
	// TODO: Validate ~everything
	if (provinceSettings.provinces.length !== initData.provinces.length) {
		gameCreationError(name, "ProvinceSettings and InitData does not contain same amount of data!");
		return null;
	}

	let newProvinces: IProvince[] = [];
	provinceSettings.provinces.forEach((province: ProvinceData, index: number) => {
		let data: InitProvinceData = initData.provinces[index];
		newProvinces.push({
			id: index, // Province must have index saved since it can move between players
			size: data.size,
			population: data.population,
			armies: [], // TODO: When initData contain neutral forces createArmy(3, 1)
			resources: data.resources
		});
	});

	let newPlayers: IPlayer[] = [];
	initData.players.forEach((data: InitPlayerData, index: number) => {
		// Mb. someday multiple provinces
		let startProvince = newProvinces.splice(data.startingLocation, 1)[0];
		startProvince.armies.push({
			ownerID: index,
			units: { infantry: 3, cavalry: 1 }
		});

		newPlayers.push({
			color: data.color,
			name: data.name, // Customizable?
			description: data.description, // Customizable?
			orders: [],

			// Nation related
			provinces: [startProvince],
			gold: data.gold,
			mp: data.mp,
			faith: data.faith,
			techs: data.techs
		});
	});

	return {
		name: name,
		players: newPlayers,
		neutralProvinces: newProvinces,
		messages: [],
		turn: 1,
		settingsFile: settingsFile,
		provinceFile: provinceFile,
		religions: []
	}
}
