/// <reference path="interfaces.ts" />

// Mongodb

import * as mongodb from "mongodb";

let server : mongodb.Server = new mongodb.Server('localhost', 27017, {});
let db : mongodb.Db = new mongodb.Db('mydb', server, { w: 1 });
db.open(function() {});

// TODO: Rename, DB-ending sounds stupid as *duck*
export type IPlayerDB = SPlayer<mongodb.ObjectID>;
export type IProvinceDB = SProvince<mongodb.ObjectID>;
export type IArmyDB = SArmy<mongodb.ObjectID>;
export type IUnitDB = SUnit<mongodb.ObjectID>;
