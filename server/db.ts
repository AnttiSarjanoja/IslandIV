/// <reference path="interfaces.ts" />
/// <reference path="../app/ts/unit_type.ts" />

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
