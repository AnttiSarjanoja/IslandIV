/// <reference path="player_color.ts" />
/// <reference path="../../server/interfaces.ts" />

// Holds general information about the player. Any need for more complicated implementation?
class Player implements IPlayer {   
    readonly _id: string;
    readonly color: PlayerColor;
    readonly name: string;

    constructor(id: string, color: PlayerColor, name: string) {
        this._id = id;
        this.color = color;
        this.name = name;
    }

}