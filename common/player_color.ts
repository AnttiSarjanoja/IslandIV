type PlayerColor =
	"GREEN" |
	"RED" |
	"BLUE" |
	"YELLOW" |
	"PURPLE" |
	"ORANGE" |
	"ERROR" // TODO: Should use this?

function ColorToNumber(color: PlayerColor) : number {
	switch(color) {
	case "GREEN":  return 0x00FF00;
	case "RED":    return 0xFF0000;
	case "BLUE":   return 0x0000FF;
	case "YELLOW": return 0xFFFF00;
	case "PURPLE": return 0x800080;
	case "ORANGE": return 0xFFA500;
	}
	console.log("Faulty player color warning!");
	return 0xFFFFFF; // TODO: Error color
}
