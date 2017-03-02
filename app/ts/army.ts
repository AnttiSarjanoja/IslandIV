/// <reference path="player.ts" />
/// <reference path="drawable.ts" />
/// <reference path="../../server/interfaces.ts" />

// NOTE: Probably needs drawable, or at least container for units
class Army implements IArmy {
    _id: string;
    owner: Player;
    units: Unit[];
}