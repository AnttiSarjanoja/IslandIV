import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as db from "./db";

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  // TODO: Better responses, codes, etc.
  private routes(): void {
    this.express.get('/data', (req, res) => {
      console.log("Got data request.");
      res.status(200).json(db.createGame()); // TODO: Status does not work here :(
    });
    this.express.post('/orders', (req, res) => {
      console.log(JSON.stringify(req.body)); // TODO: Just a dummy
      res.sendStatus(200);
      // db.SaveOrders(req.body);
    });
    this.express.use(express.static(__dirname + '/public'));
  }
}

export default new App().express;
