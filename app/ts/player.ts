/// <reference path="player_color.ts" />

// Holds general information about the player. Any need for more complicated implementation?
class Player {   
    readonly id: number;
    readonly color: PlayerColor;
    readonly name: string;

    constructor(id: number, color: PlayerColor, name: string) {
        this.id = id;
        this.color = color;
        this.name = name;
    }

}