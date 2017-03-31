import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';

import Game from "./game";
import * as db from "./db";

// Creates and configures an ExpressJS web server.
class App {
	public express: express.Application;
	public Games: Game[] = []; // TODO: Backend class for game stuff

	//Run configuration methods on the Express instance.
	constructor() {
		this.express = express();
		this.middleware();
		this.routes();

		db.Open(() => {
			db.GetStuff((games: IGame[]) => {
				if (games !== undefined && games.length > 0) {
					console.log("Loaded following games from db:");
					console.log(games.map((game: IGame) => { return game.name + " turn: " + game.turn; }));
					this.initGames(games);
				}
				else console.log("Got some random *dung*");
			});
		});
	}

	private initGames(games: IGame[]) {
		for(let game of games) {
			try {
				let newGame: Game = new Game(game,
					JSON.parse(fs.readFileSync(__dirname + '/public/' + game.provinceFile, 'utf8')),
					JSON.parse(fs.readFileSync(__dirname + '/public/' + game.settingsFile, 'utf8'))
				);
				this.Games.push(newGame);
			}
			catch (e) {
				console.log("Error initing game: '" + game.name + "'");
				console.log("  Reason: " + e);
			}
		}
	}

  // Configure Express middleware.
	private middleware(): void {
		this.express.use(bodyParser.json());
		this.express.use(bodyParser.urlencoded({ extended: false }));
	}

	// TODO: Any other way of stripping non-IGame stuff away from 'any' ?
	private filterGameData(game: any): IGame {
		return {
			name: game.name,
			players: game.players,
			messages: game.messages,
			turn: game.turn,
			settingsFile: game.settingsFile,
			provinceFile: game.provinceFile,
			religions: game.religions
		}
	}

	// Configure API endpoints.
	// TODO: Better responses, codes, etc.
	private routes(): void {
		this.express.get('/data', (req, res) => {
			if (this.Games.length > 0) {
				console.log("Sending actual gamedata");
				// TODO: Remove _id *dung* from sent object
				res.status(200).json(this.filterGameData(this.Games[0])); // TODO: Get the requested game, now there is only one
			}
			else {
				console.log("Sending dummy gamedata");
				res.status(200).json(this.filterGameData(db.createGame())); // TODO: Status does not work here :(
			} // Send dummydata when not using DB
		});
		this.express.post('/orders', (req, res) => {
			console.log("Received sent orders");
			if (req.body.player === undefined ||
				req.body.turn === undefined ||
				req.body.orders === undefined) {
				console.log("Got faulty data");
				res.sendStatus(400); // What is correct?
			}
			else {
				res.sendStatus(200);
				db.SaveOrders(req.body.player, req.body.turn, req.body.orders);
			}
		});
		this.express.use(express.static(__dirname + '/public'));
	}
}

export default new App().express;
