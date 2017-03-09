// TODO: Relocate

function StringToColor(text : string) : PlayerColor {
    switch(text) {
        case "GREEN":    return PlayerColor.GREEN;
        case "RED":    return PlayerColor.RED;
        case "BLUE":    return PlayerColor.BLUE;
        case "YELLOW":    return PlayerColor.YELLOW;
        case "PURPLE":    return PlayerColor.PURPLE;
        case "ORANGE":    return PlayerColor.ORANGE;
    }
    return PlayerColor.ERROR;
}

function ColorToNumber(color : PlayerColor) : number {
	switch(color) {
	case PlayerColor.GREEN:  return 0x00FF00;
	case PlayerColor.RED:    return 0xFF0000;
	case PlayerColor.BLUE:   return 0x0000FF;
	case PlayerColor.YELLOW: return 0xFFFF00;
	case PlayerColor.PURPLE: return 0x800080;
	case PlayerColor.ORANGE: return 0xFFA500;
	}
    return 0xFFFFFF; // TODO: Error color
}

enum PlayerColor {
    GREEN = 1,
    RED,
    BLUE,
    YELLOW,
    PURPLE,
    ORANGE,

    ERROR // TODO: Should use this?
}