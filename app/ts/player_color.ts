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
}

enum PlayerColor {
    GREEN,
    RED,
    BLUE,
    YELLOW,
    PURPLE,
    ORANGE
}