/// <reference path="player.ts" />
/// <reference path="unit_type.ts" />

// TODO: Inherits Drawable? Probably yes
class Province {
	private owner : Player; // TODO: Player class 
    private units : { [ unit in UnitType] : number };
}