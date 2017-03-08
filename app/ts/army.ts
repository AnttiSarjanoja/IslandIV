/// <reference path="player.ts" />
/// <reference path="drawable.ts" />
/// <reference path="../../server/interfaces.ts" />

// NOTE: Probably needs drawable, or at least container for units
class Army extends Drawable implements IArmy {
    owner: Player;
    units: Unit[];
}