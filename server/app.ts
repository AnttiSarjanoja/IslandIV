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
  private routes(): void {
    this.express.use('/data', (req, res) => {
      res.json(db.createGame());
    });
    this.express.use(express.static(__dirname + '/public'));
  }
}

export default new App().express;
